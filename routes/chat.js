const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { requireAuth } = require('./auth');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/system_9.0.txt'),
  'utf8'
);

router.post('/', requireAuth, async (req, res) => {
  const question = (req.body.question || '').trim();
  if (!question) {
    return res.status(400).json({ error: 'Vraag ontbreekt' });
  }

  try {
    console.log('SYSTEM PROMPT (eerste 120 tekens):', systemPrompt.slice(0, 120));
const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    const answer = completion.choices[0].message.content;
    return res.json({ answer });
  } catch (error) {
    console.error('OpenAI error', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
