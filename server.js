const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const db = require('./db.js');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// Stel de map 'public' in als plek voor al je statische bestanden (HTML/CSS/JS)
app.use('/public', express.static('public'));

// Als iemand naar de root ("/") gaat, stuur dan automatisch je chat.html
app.get('/', (_req, res) => res.sendFile(__dirname + '/public/chat.html'));
app.use('/public', express.static('public'));

const SECRET = process.env.WP_JWT_SECRET;

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.data?.user?.id || payload.userId || payload.id;
    if (!req.userId) throw new Error("Invalid token payload");
    next();
  } catch (e) {
    console.error("Auth error:", e);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.post('/ask', requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Empty question' });
  try {
    const figures = await db.getFigures(req.userId);
    const prompt = `Je bent Finny, een AI-accountant. Hier zijn de cijfers: ${JSON.stringify(figures)}. Beantwoord: ${message}`;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Antwoord in het Nederlands. Gebruik alleen de meegeleverde cijfers.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });
    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.listen(PORT, () => console.log(`✅ Finny v1.0 draait op http://localhost:${PORT}`));
