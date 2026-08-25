import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pkg from 'pg';
import authRoutes from './routes/auth.js';
import quotaRoutes from './routes/quota.js';
import generateRoutes from './routes/generate.js';
import historyRoutes from './routes/history.js';
import dashboardRoutes from './routes/dashboard.js';
import subscriptionRoutes from './routes/subscription.js';
import webhookRoutes from './routes/webhook.js';
import { generalLimiter } from './middleware/rateLimiters.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5001;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('🔴 Unexpected error pada PostgreSQL pool:', err);
});

// --- Security headers dasar ---
app.use(helmet());

// --- CORS: hanya izinkan origin yang eksplisit terdaftar di .env, bukan wildcard "*" ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (misal curl, server-to-server/webhook Midtrans)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin tidak diizinkan oleh CORS.'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// --- Rate limit umum untuk semua route /api ---
app.use('/api', generalLimiter);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, message: 'Server & database OK', data: { db_time: result.rows[0].now } });
  } catch (err) {
    console.error('🔴 Health check gagal:', err.message);
    res.status(500).json({ success: false, message: 'Database tidak bisa diakses', data: null });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/quota', quotaRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhook', webhookRoutes);

// --- 404 & error handler — WAJIB paling bawah, setelah semua route ---
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Backend jalan di http://localhost:${PORT}`);
});