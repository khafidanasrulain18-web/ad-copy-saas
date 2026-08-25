import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../server.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import {
  registerValidators, loginValidators, verifyEmailValidators, resendOtpValidators, handleValidation,
} from '../middleware/validators.js';
import { generateOtp, otpExpiry } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import { forgotPasswordValidators } from '../middleware/validators.js';
import { resetPasswordValidators } from '../middleware/validators.js';
const router = express.Router();

function issueToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// --- REGISTER — buat user (belum verified), kirim OTP, TIDAK langsung login ---
router.post('/register', authLimiter, registerValidators, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.', data: null });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateOtp();
    const expiresAt = otpExpiry(10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified, otp_code, otp_expires_at)
       VALUES ($1, $2, false, $3, $4) RETURNING id, email`,
      [email, passwordHash, code, expiresAt]
    );
    const user = result.rows[0];

    await pool.query(`INSERT INTO subscriptions (user_id, status, plan) VALUES ($1, 'expired', 'free')`, [user.id]);

    try {
      await sendOtpEmail(email, code);
    } catch (mailErr) {
      console.error('🔴 Gagal kirim email OTP:', mailErr.message);
      // User tetap tersimpan, tapi beri tahu supaya bisa coba resend
      return res.status(201).json({
        success: true,
        message: 'Akun dibuat, tapi gagal mengirim email verifikasi. Coba kirim ulang kode.',
        data: { email: user.email, requiresVerification: true, emailSendFailed: true },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Kode verifikasi sudah dikirim ke email kamu.',
      data: { email: user.email, requiresVerification: true },
    });
  } catch (err) {
    console.error('🔴 Register error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

// --- VERIFY EMAIL — cek OTP, aktifkan akun, baru issue token ---
router.post('/verify-email', authLimiter, verifyEmailValidators, handleValidation, async (req, res) => {
  try {
    const { email, code } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.', data: null });
    }
    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email sudah terverifikasi. Silakan login.', data: null });
    }
    if (!user.otp_code || !user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Kode sudah kedaluwarsa. Minta kode baru.', data: { expired: true } });
    }
    if (user.otp_code !== code) {
      return res.status(400).json({ success: false, message: 'Kode verifikasi salah.', data: null });
    }

    await pool.query(
      `UPDATE users SET email_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE id = $1`,
      [user.id]
    );

    const token = issueToken(user);
    res.json({
      success: true,
      message: 'Email berhasil diverifikasi.',
      data: { token, user: { id: user.id, email: user.email } },
    });
  } catch (err) {
    console.error('🔴 Verify email error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

// --- RESEND OTP ---
router.post('/resend-otp', authLimiter, resendOtpValidators, handleValidation, async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Pesan digeneralisasi supaya tidak bocorkan email mana yang terdaftar
    if (!user || user.email_verified) {
      return res.json({ success: true, message: 'Kalau email terdaftar dan belum diverifikasi, kode baru sudah dikirim.', data: null });
    }

    const code = generateOtp();
    const expiresAt = otpExpiry(10);
    await pool.query('UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3', [code, expiresAt, user.id]);

    await sendOtpEmail(email, code);

    res.json({ success: true, message: 'Kode baru sudah dikirim ke email kamu.', data: null });
  } catch (err) {
    console.error('🔴 Resend OTP error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengirim ulang kode.', data: null });
  }
});

// --- LOGIN — blokir kalau belum verified ---
router.post('/login', authLimiter, loginValidators, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.', data: null });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.', data: null });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email belum diverifikasi. Cek kode yang dikirim ke email kamu.',
        data: { requiresVerification: true, email: user.email },
      });
    }

    const token = issueToken(user);
    res.json({ success: true, message: 'Login berhasil.', data: { token, user: { id: user.id, email: user.email } } });
  } catch (err) {
    console.error('🔴 Login error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan.', data: null });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, message: 'Token valid.', data: { user: { id: decoded.userId, email: decoded.email } } });
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid.', data: null });
  }
});
// ... (semua route sebelumnya: register, verify-email, resend-otp, login, me — TETAP SAMA seperti Tahap 11) ...

// --- FORGOT PASSWORD — kirim OTP reset ---
router.post('/forgot-password', authLimiter, forgotPasswordValidators, handleValidation, async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Pesan digeneralisasi — sama seperti resend-otp, cegah user enumeration
    if (!user) {
      return res.json({ success: true, message: 'Kalau email terdaftar, kode reset sudah dikirim.', data: null });
    }

    const code = generateOtp();
    const expiresAt = otpExpiry(10);
    await pool.query('UPDATE users SET reset_otp = $1, reset_otp_expires_at = $2 WHERE id = $3', [code, expiresAt, user.id]);

    await sendResetPasswordEmail(email, code);

    res.json({ success: true, message: 'Kalau email terdaftar, kode reset sudah dikirim.', data: null });
  } catch (err) {
    console.error('🔴 Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

// --- RESET PASSWORD — verifikasi kode, set password baru ---
router.post('/reset-password', authLimiter, resetPasswordValidators, handleValidation, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'Kode reset tidak valid.', data: null });
    }
    if (!user.reset_otp || !user.reset_otp_expires_at || new Date(user.reset_otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Kode sudah kedaluwarsa. Minta kode baru.', data: { expired: true } });
    }
    if (user.reset_otp !== code) {
      return res.status(400).json({ success: false, message: 'Kode reset salah.', data: null });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expires_at = NULL WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({ success: true, message: 'Password berhasil diganti. Silakan login.', data: null });
  } catch (err) {
    console.error('🔴 Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', data: null });
  }
});

export default router;