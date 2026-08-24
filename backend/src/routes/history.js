import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../server.js';

const router = express.Router();

// GET /api/history?contentType=ad_copy&from=2026-08-01&to=2026-08-31&page=1&limit=10
router.get('/', requireAuth, async (req, res) => {
  try {
    const { contentType, from, to, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50); // cap max 50/halaman
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['user_id = $1'];
    const values = [req.user.userId];
    let paramIndex = 2;

    if (contentType) {
      conditions.push(`content_type = $${paramIndex}`);
      values.push(contentType);
      paramIndex++;
    }
    if (from) {
      conditions.push(`generated_at >= $${paramIndex}`);
      values.push(from);
      paramIndex++;
    }
    if (to) {
      conditions.push(`generated_at <= $${paramIndex}`);
      values.push(to);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM usage_logs WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

        const dataResult = await pool.query(
      `SELECT id, generated_at, tokens_used, cost_estimate, content_type, input_brief, output_results
       FROM usage_logs
       WHERE ${whereClause}
       ORDER BY generated_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limitNum, offset]
    );

    res.json({
      success: true,
      message: 'History berhasil diambil.',
      data: {
        items: dataResult.rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('🔴 Get history error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

export default router;