import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { checkQuota } from '../utils/quota.js';

const router = express.Router();

// GET /api/quota — cek sisa quota user yang sedang login
router.get('/', requireAuth, async (req, res) => {
  try {
    const { allowed, remaining, isPaid } = await checkQuota(req.user.userId);

    res.json({
      success: true,
      message: 'Quota berhasil diambil.',
      data: {
        plan: isPaid ? 'paid' : 'free',
        unlimited: isPaid,
        remaining: isPaid ? null : remaining,
        canGenerate: allowed,
      },
    });
  } catch (err) {
    console.error('🔴 Get quota error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

export default router;