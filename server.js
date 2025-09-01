const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const app = express();
try { require('dotenv').config(); } catch (_) {}

let pkg = { version: "4.8.1" };
try { pkg = require('./package.json'); } catch (_) {}
const VERSION = pkg.version || "4.8.1";
const COMMIT = process.env.GIT_COMMIT || "local";

const PROMPT_FILE = process.env.PROMPT_FILE || path.join(__dirname, 'prompts', 'prompt_finny_mini.txt');
function readPromptSafe(file){
  try { const t = fs.readFileSync(file,'utf8'); const h = crypto.createHash('sha1').update(t).digest('hex').slice(0,12); return {ok:true,text:t,hash:h,file}; }
  catch(e){ return {ok:false,error:e.message,file}; }
}
const promptInfo = readPromptSafe(PROMPT_FILE);

app.use(express.urlencoded({extended:true}));
app.use(express.json());

// Static if present
if (fs.existsSync(path.join(__dirname,'public'))) {
  app.use('/public', express.static(path.join(__dirname,'public')));
}

// Mount SharePoint file listing if present
try { app.use('/sp', require('./routes/sp')); } catch(_) {}

app.get('/', (_req,res)=>res.type('html').send(`
<!doctype html>
<html><head><meta charset="utf-8"><title>Finny 4.8.1</title></head><body style="font-family:system-ui;max-width:900px;margin:32px auto">
  <h2>Finny ${VERSION} (local backup)</h2>
  <p style="color:#555">Commit: ${COMMIT}</p>
  <p>Prompt: <code>${promptInfo.file}</code> ${promptInfo.ok?`(#${promptInfo.hash})`:`(❌ ${promptInfo.error})`}</p>
  <p>
    <a href="/health">/health</a> •
    <a href="/debug/prompt">/debug/prompt</a> •
    <a href="/sp/files/html">/sp/files/html</a> •
    <a href="/chat">/chat</a>
  </p>
  <form id="f" style="margin-top:16px">
    <input name="q" placeholder="Stel een vraag…" style="width:60%;padding:8px"/>
    <button type="submit">Vraag</button>
  </form>
  <pre id="out" style="white-space:pre-wrap;background:#f8f8f8;padding:12px;border-radius:8px"></pre>
  <script>
    const f = document.getElementById('f'); const out = document.getElementById('out');
    f.onsubmit = async (e)=>{
      e.preventDefault(); const q = new FormData(f).get('q'); out.textContent="Bezig…";
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})});
      const d = await r.json();
      out.textContent = d.answer || d.antwoord || d.content || d.text || JSON.stringify(d,null,2);
    };
  </script>
</body></html>
`));

app.get('/chat', (req,res)=>res.redirect('/'));

app.get('/health', (_req,res)=>res.json({
  ok:true, version:VERSION, commit:COMMIT,
  prompt:{ ok:promptInfo.ok, file:promptInfo.file, hash:promptInfo.ok?promptInfo.hash:null, length:promptInfo.ok?promptInfo.text.length:0 },
  ts:new Date().toISOString()
}));

app.get('/debug/prompt', (_req,res)=>{
  if(!promptInfo.ok) return res.status(500).json(promptInfo);
  res.json({ file:promptInfo.file, hash:promptInfo.hash, preview:promptInfo.text.slice(0,400) });
});

async function callOpenAI(q, sys){
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if(!key) throw new Error('OPENAI_API_KEY missing');
  const url='https://api.openai.com/v1/chat/completions';
  const body={ model, messages:[ {role:'system',content:sys||''},{role:'user',content:q} ], temperature:0.2, max_tokens:800 };
  const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify(body)});
  if(!r.ok){ const t=await r.text(); throw new Error(`OpenAI error ${r.status}: ${t}`); }
  const j = await r.json();
  return (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '').trim();
}

app.post('/api/chat', async (req,res)=>{
  const q = (req.body?.q||'').trim();
  if(!q) return res.status(400).json({error:'q required'});

  // If OPENAI is configured, answer via model using the mini prompt.
  if (process.env.OPENAI_API_KEY) {
    try{
      const ans = await callOpenAI(q, promptInfo.ok?promptInfo.text:'');
      return res.json({ answer: ans, provider:'openai', version:VERSION, promptHash: promptInfo.ok?promptInfo.hash:null });
    }catch(e){
      return res.status(502).json({ error: e.message });
    }
  }

  // Stub fallback (no external calls)
  const s = q.toLowerCase();
  const router = s.includes('omzet') ? { type:'pdf', hint:'jaarrekening_2023' } :
                 s.includes('2022')   ? { type:'csv', hint:'omzet_2022.csv' } :
                 { type:'unknown', hint:null };
  res.json({
    answer: `Geen model geconfigureerd. Voeg OPENAI_API_KEY toe voor echte antwoorden. (router: ${router.type}${router.hint?(' '+router.hint):''})`,
    provider: 'stub',
    version: VERSION,
    promptHash: promptInfo.ok?promptInfo.hash:null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`[Finny ${VERSION}] :${PORT}`);
  console.log(`PROMPT_FILE=${PROMPT_FILE} -> ${promptInfo.ok?('OK #'+promptInfo.hash):('MISSING: '+promptInfo.error)}`);
});
