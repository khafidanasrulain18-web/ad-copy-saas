import express from 'express';
import crypto from 'crypto';
import { PLANS } from '../config/plans.js';
import { pool } from '../server.js';

const router = express.Router();

function verifySignature({ order_id, status_code, gross_amount, signature_key }) {
  const raw = order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');
  return expected === signature_key;
}

// POST /api/webhook/midtrans — notifikasi status transaksi dari Midtrans
router.post('/midtrans', async (req, res) => {
  try {
    const notification = req.body;
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = notification;

    // ── 1. VALIDASI SIGNATURE — WAJIB, cegah request palsu yang ngaku-ngaku dari Midtrans ──
    if (!verifySignature({ order_id, status_code, gross_amount, signature_key })) {
      console.error('🔴 Webhook signature tidak valid untuk order:', order_id);
      return res.status(403).json({ success: false, message: 'Signature tidak valid.', data: null });
    }

    // ── 2. CARI subscription row berdasarkan order_id yang kita simpan saat checkout ──
    const subResult = await pool.query(
      'SELECT * FROM subscriptions WHERE latest_order_id = $1',
      [order_id]
    );
    const subscription = subResult.rows[0];

    if (!subscription) {
      console.error('🔴 Webhook: order_id tidak ditemukan di database:', order_id);
      // Tetap return 200 supaya Midtrans tidak retry terus untuk order yang memang tidak kita kenal
      return res.status(200).json({ success: true, message: 'Order tidak ditemukan, diabaikan.', data: null });
    }

    // ── 3. IDEMPOTENCY — kalau status sudah 'active' & belum expired, jangan proses ulang ──
    // Midtrans bisa kirim notifikasi duplikat untuk order yang sama.
    if (
      subscription.status === 'active' &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end) > new Date()
    ) {
      return res.status(200).json({ success: true, message: 'Sudah diproses sebelumnya.', data: null });
    }

    // ── 4. UPDATE status berdasarkan transaction_status dari Midtrans ──
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status && fraud_status !== 'accept') {
        console.warn('🟡 Transaksi flagged fraud, diabaikan:', order_id);
        return res.status(200).json({ success: true, message: 'Fraud flagged, diabaikan.', data: null });
      }

      const plan = PLANS[subscription.plan];
      const periodEnd = new Date(Date.now() + (plan?.durationDays || 30) * 24 * 60 * 60 * 1000);

      await pool.query(
        `UPDATE subscriptions SET status = 'active', current_period_end = $1, updated_at = now()
         WHERE latest_order_id = $2`,
        [periodEnd, order_id]
      );
      console.log(`✅ Subscription aktif untuk order ${order_id}, berlaku sampai ${periodEnd.toISOString()}`);
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      await pool.query(
        `UPDATE subscriptions SET status = 'expired', updated_at = now() WHERE latest_order_id = $1`,
        [order_id]
      );
      console.log(`🟡 Subscription gagal/dibatalkan untuk order ${order_id}: ${transaction_status}`);
    }
    // status 'pending' sengaja tidak diapa-apakan — tunggu notifikasi berikutnya

    res.status(200).json({ success: true, message: 'Webhook diproses.', data: null });
  } catch (err) {
    console.error('🔴 Webhook error:', err.message);
    // Tetap return 200 ke Midtrans supaya tidak infinite retry kalau errornya di sisi kita —
    // tapi errornya sudah ter-log untuk investigasi manual
    res.status(200).json({ success: false, message: 'Error internal, sudah dicatat.', data: null });
  }
});

export default router;