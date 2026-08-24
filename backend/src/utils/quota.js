import { pool } from '../server.js';

const FREE_TIER_MONTHLY_LIMIT = parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || '10', 10);

function currentMonth() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

// Cek apakah user punya subscription aktif & belum expired.
// Status subscription SELALU dicek real-time, tidak pakai cache.
async function hasActiveSubscription(userId) {
  const result = await pool.query(
    `SELECT * FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND current_period_end > now()
     ORDER BY current_period_end DESC LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) return false;
  return true;
}

// Ambil atau buat baris quota bulan ini untuk user.
// Kalau bulan baru dan belum ada baris, otomatis dibuat = "reset" alami.
async function getOrCreateQuotaRow(userId) {
  const month = currentMonth();

  const existing = await pool.query(
    'SELECT * FROM usage_quota WHERE user_id = $1 AND month = $2',
    [userId, month]
  );

  if (existing.rows.length > 0) return existing.rows[0];

  const created = await pool.query(
    `INSERT INTO usage_quota (user_id, month, generate_count, quota_limit)
     VALUES ($1, $2, 0, $3)
     RETURNING *`,
    [userId, month, FREE_TIER_MONTHLY_LIMIT]
  );
  return created.rows[0];
}

// Dipanggil SEBELUM panggil OpenAI. Return { allowed, remaining, isPaid, quotaRow }
export async function checkQuota(userId) {
  const isPaid = await hasActiveSubscription(userId);

  if (isPaid) {
    // Paid tier = unlimited, tidak perlu cek angka
    return { allowed: true, remaining: null, isPaid: true, quotaRow: null };
  }

  const quotaRow = await getOrCreateQuotaRow(userId);
  const remaining = quotaRow.quota_limit - quotaRow.generate_count;

  return {
    allowed: remaining > 0,
    remaining: Math.max(remaining, 0),
    isPaid: false,
    quotaRow,
  };
}

// Dipanggil SETELAH generate sukses, untuk mencatat pemakaian.
// Hanya increment untuk Free tier — paid tier tidak dibatasi tapi tetap dicatat di usage_logs (Tahap 4).
export async function incrementQuota(userId) {
  const month = currentMonth();
  await pool.query(
    `UPDATE usage_quota SET generate_count = generate_count + 1
     WHERE user_id = $1 AND month = $2`,
    [userId, month]
  );
}

export { FREE_TIER_MONTHLY_LIMIT };