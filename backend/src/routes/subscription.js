import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { snap } from '../utils/midtrans.js';
import { PLANS } from '../config/plans.js';
import { pool } from '../server.js';

const router = express.Router();

// GET /api/subscription/plans — buat halaman pricing frontend
router.get('/plans', (req, res) => {
  res.json({ success: true, message: 'Daftar plan.', data: PLANS });
});

// POST /api/subscription/checkout — buat transaksi Midtrans, return Snap token
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ success: false, message: 'Plan tidak valid.', data: null });
    }

    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.userId]);
    const userEmail = userResult.rows[0]?.email;

    // order_id harus unik — gabungkan userId + timestamp + random supaya tidak bentrok
    const orderId = `SUB-${req.user.userId.slice(0, 8)}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: plan.price,
      },
      customer_details: { email: userEmail },
      // Metadata custom untuk kita baca lagi di webhook
      item_details: [{ id: planId, price: plan.price, quantity: 1, name: plan.name }],
    });

    // Simpan order_id di subscription row user ini SEBELUM user bayar,
    // supaya webhook nanti bisa mencocokkan order_id → user_id dengan pasti.
    await pool.query(
      `INSERT INTO subscriptions (user_id, status, plan, latest_order_id)
       VALUES ($1, 'expired', $2, $3)`,
      [req.user.userId, planId, orderId]
    );

    res.json({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      data: { snapToken: transaction.token, redirectUrl: transaction.redirect_url, orderId },
    });
  } catch (err) {
    console.error('🔴 Checkout error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi.', data: null });
  }
});

export default router;