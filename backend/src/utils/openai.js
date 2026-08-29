import OpenAI from 'openai';

// DeepSeek API kompatibel dengan format OpenAI — cukup ganti baseURL & apiKey.
// Nama file/variable "openai" sengaja dipertahankan supaya import di file lain tidak perlu berubah.
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export default openai;