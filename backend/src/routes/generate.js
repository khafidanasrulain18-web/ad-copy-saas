import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateLimiter } from '../middleware/rateLimiters.js';
import { generateValidators, handleValidation } from '../middleware/validators.js';
import { checkQuota, incrementQuota } from '../utils/quota.js';
import { buildSystemPrompt, buildUserPrompt } from '../utils/prompt.js';
import openai from '../utils/openai.js';
import { pool } from '../server.js';

const router = express.Router();
const MAX_TOKENS = 800;

router.post('/', requireAuth, generateLimiter, generateValidators, handleValidation, async (req, res) => {
  try {
    const { productName, description, audience, tone, platform, variations } = req.body;
    const numVariations = parseInt(variations, 10);

    const quota = await checkQuota(req.user.userId);
    if (!quota.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Quota generate bulan ini sudah habis. Upgrade ke Paid untuk unlimited generate.',
        data: { upgradeRequired: true },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat', // model DeepSeek, setara gpt-4o-mini untuk kasus ini, jauh lebih murah
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt({ productName, description, audience, tone, platform, variations: numVariations }) },
      ],
    });

    const rawOutput = completion.choices[0].message.content;
    const results = rawOutput.split('---').map((s) => s.trim()).filter(Boolean);

    const tokensUsed = completion.usage?.total_tokens || 0;
    // Estimasi biaya DeepSeek-chat (per Jan 2026, cek harga terbaru di platform.deepseek.com/api-docs/pricing):
    // ~$0.28/1M input, ~$0.42/1M output (cache miss) — jauh lebih murah dari gpt-4o-mini.
    // Estimasi kasar gabungan dari total_tokens, cukup untuk monitoring internal.
    const costEstimate = (tokensUsed / 1_000_000) * 0.35;

    await pool.query(
      `INSERT INTO usage_logs (user_id, tokens_used, cost_estimate, content_type, input_brief, output_results)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.userId, tokensUsed, costEstimate, 'ad_copy',
        JSON.stringify({ productName, description, audience, tone, platform, variations: numVariations }),
        JSON.stringify(results),
      ]
    );

    if (!quota.isPaid) await incrementQuota(req.user.userId);

    res.json({
      success: true,
      message: 'Copy iklan berhasil dibuat.',
      data: { results, remainingQuota: quota.isPaid ? null : quota.remaining - 1 },
    });
  } catch (err) {
    console.error('🔴 Generate error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ success: false, message: 'Server sedang sibuk atau limit tercapai. Coba lagi sebentar.', data: null });
    }
    res.status(500).json({ success: false, message: 'Gagal generate copy iklan.', data: null });
  }
});

export default router;