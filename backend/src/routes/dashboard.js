import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { checkQuota } from '../utils/quota.js';
import { pool } from '../server.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const quota = await checkQuota(req.user.userId);

    const subResult = await pool.query(
      `SELECT status, plan, current_period_end FROM subscriptions
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.userId]
    );
    const subscription = subResult.rows[0] || null;

    const totalGenerateResult = await pool.query(
      `SELECT COUNT(*) FROM usage_logs WHERE user_id = $1`,
      [req.user.userId]
    );

    res.json({
      success: true,
      message: 'Dashboard berhasil diambil.',
      data: {
        plan: quota.isPaid ? 'paid' : 'free',
        quota: {
          unlimited: quota.isPaid,
          remaining: quota.isPaid ? null : quota.remaining,
        },
        subscription,
        totalGenerateAllTime: parseInt(totalGenerateResult.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('🔴 Get dashboard error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

export default router;