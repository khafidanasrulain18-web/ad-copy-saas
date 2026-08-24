import OpenAI from 'openai';

// API key HANYA dibaca dari env, TIDAK PERNAH hardcoded, TIDAK PERNAH dikirim ke frontend
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;