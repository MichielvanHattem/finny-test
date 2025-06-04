import fs from 'fs';
import path from 'path';

export function dumpPrompt(messages) {
  if (process.env.LOG_PROMPT !== '1' && process.env.LOG_PROMPT !== 'true') return;

  try {
    const file = path.join('/tmp', `prompt_${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(messages, null, 2), 'utf8');
    console.log(`[Prompt dump] ${file} (${messages.length} msgs)`);
  } catch (err) {
    console.error('[Prompt dump error]', err);
  }
}
