import OpenAI from 'openai';
import { dumpPrompt } from '../utils/logPrompt.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI(messages) {
  dumpPrompt(messages);

  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    max_tokens: 1024,
    temperature: 0.2,
  });
}
