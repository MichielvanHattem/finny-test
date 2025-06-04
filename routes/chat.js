// routes/chat.js – Finny 4.2.1 (Prompt 9.2 compliant)
// -----------------------------------------------
// Eén bestand, kant‑en‑klaar ter vervanging van je huidige routes/chat.js.
// • Laadt system‑prompt slechts één keer bij opstarten.
// • Haalt cijfers uit JSON‑file in PARSED_DIR.
// • Geeft die cijfers expliciet mee als aparte user‑message, zodat GPT
//   niet meer om de jaarrekening vraagt.
// • Bevat minimale debug‑logs (aan/uit via ENV‑var DEBUG_PROMPT).

const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const requireAuth = require('../auth');

// --- Config -----------------------------------------------------------------
const PROMPT_FILE = process.env.PROMPT_FILE || path.join(__dirname, '../prompts/system_9.0.txt');
const PARSED_DIR = process.env.PARSED_DIR || '/var/data/parsed';
const MODEL      = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEBUG      = process.env.DEBUG_PROMPT === 'true';

// --- System‑prompt eenmalig inlezen -----------------------------------------
let systemPrompt = '';
try {
  systemPrompt = fs.readFileSync(PROMPT_FILE, 'utf8');
} catch (err) {
  console.error('❌  System‑prompt niet gevonden:', PROMPT_FILE, err.message);
  systemPrompt = 'Je bent Finny, een accounting‑chatbot, maar de system‑prompt is niet geladen.';
}

// -----------------------------------------------
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: figures voor userId ophalen (valt terug op demo‑bestand)
function loadFigures(userId = 'demo') {
  const filePath = path.join(PARSED_DIR, `user_${userId}.json`);
  try {
    return require(filePath);
  } catch {
    return {};
  }
}

router.post('/', requireAuth, async (req, res) => {
  const question = (req.body.question || '').trim();
  if (!question) return res.status(400).json({ error: 'Vraag ontbreekt' });

  // 1. figures laden ----------------------------------------------
  const userId  = req.user?.id || 'demo';
  const figures = loadFigures(userId);
  const figures23 = figures['Jaarrekening 2023'] || {};

  if (DEBUG) {
    console.log('SYSTEM PROMPT (120):', systemPrompt.slice(0, 120));
    console.log('FIGURES 2023:', figures23);
  }

  try {
    // 2. OpenAI‑call ----------------------------------------------
const { dumpPrompt } = require('../utils/logPrompt');
    dumpPrompt(messages);
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: JSON.stringify(figures23) },
        { role: 'user',   content: question }
      ]
    });

    const answer = completion.choices?.[0]?.message?.content || '‑';
    return res.json({ answer });
  } catch (error) {
    console.error('OpenAI‑fout:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;