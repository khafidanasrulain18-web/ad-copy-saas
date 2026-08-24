import rateLimit from 'express-rate-limit';

function jsonRateLimitHandler(req, res) {
  res.status(429).json({
    success: false,
    message: 'Terlalu banyak request. Coba lagi beberapa saat lagi.',
    data: null,
  });
}

// Limiter umum untuk seluruh endpoint /api — proteksi dasar dari abuse/bot
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200, // 200 request per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Limiter KHUSUS endpoint generate — paling ketat, karena ini yang langsung
// berhubungan dengan biaya OpenAI. Dibatasi per user (bukan cuma per IP),
// supaya satu user tidak bisa spam generate walau quota masih tersisa.
export const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 5, // maksimal 5 request generate per menit per user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip, // key by userId kalau sudah login, fallback ke IP
  handler: jsonRateLimitHandler,
});

// Limiter untuk auth (register/login) — cegah brute-force password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 percobaan login/register per 15 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});