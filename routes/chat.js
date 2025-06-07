/**
 * routes/chat.js – POST /chat
 * Mini-fix: lees één SharePoint-bestand in en voeg de inhoud toe
 *           aan de system-prompt, zodat Finny wél context heeft.
 */

const router = require('express').Router();
const { dumpPrompt } = require('../utils/logPrompt');
const { downloadFile } = require('../utils/sp');           // ← nieuw
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    /* ───── 1. HALEN 1e BESTAND OP ───── */
    // Pas hier evt. drive-/folder-/filenaam aan:
    const buffer   = await downloadFile('Gedeelde documenten', 'GLTransactions_1.xml');
    const fileText = buffer.toString('utf8').slice(0, 20_000); // max 20kB in prompt

    /* ───── 2. SYSTEM-PROMPT BOUWEN ───── */
    const systemPrompt = {
      role: 'system',
      content:
        `Je bent Finny, financieel assistent. Hier is de inhoud van het bestand ` +
        `"GLTransactions_1.xml":\n\n${fileText}\n\nBeantwoord nu de vraag:`,
    };

    /* ───── 3. PROMPT LOGGEN & OPENAI AANROEP ───── */
    const fullPrompt = [systemPrompt, ...messages];
    dumpPrompt(fullPrompt);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: fullPrompt,
      temperature: 0.2,
      max_tokens: 1_024,
    });

    res.json(response.choices[0].message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
