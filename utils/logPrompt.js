const fs = require('fs');
const path = require('path');
function dumpPrompt(messages){if(process.env.LOG_PROMPT!=='1')return;try{const file=path.join('/tmp',`prompt_${Date.now()}.json`);fs.writeFileSync(file,JSON.stringify(messages,null,2),'utf8');console.log(`[Prompt dump] ${file}`);}catch(err){console.error('[Prompt dump error]',err);}}
module.exports={dumpPrompt};