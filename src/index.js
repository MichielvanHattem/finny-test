import express from 'express';
import bodyParser from 'body-parser';
import { callOpenAI } from './services/openai.js';

const app = express();
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }
    const completion = await callOpenAI(messages);
    res.json(completion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Finny 4.4 up on :${PORT}`));
