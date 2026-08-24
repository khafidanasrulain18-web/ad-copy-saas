-- ============================================
-- Schema untuk AI Copy Generator (Freemium SaaS)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'expired'
        CHECK (status IN ('active', 'expired', 'cancelled')),
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    midtrans_subscription_id VARCHAR(255),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Satu user idealnya cuma punya 1 baris subscription aktif yang relevan,
-- tapi kita simpan history juga agar audit trail jelas.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_estimate NUMERIC(10,6) NOT NULL DEFAULT 0,
    content_type VARCHAR(50) NOT NULL DEFAULT 'ad_copy'
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_generated_at ON usage_logs(generated_at);

-- Quota dihitung per user per bulan (format month: 'YYYY-MM')
CREATE TABLE IF NOT EXISTS usage_quota (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    generate_count INTEGER NOT NULL DEFAULT 0,
    quota_limit INTEGER NOT NULL DEFAULT 10,
    PRIMARY KEY (user_id, month)
);

-- Extension buat gen_random_uuid() (kalau belum aktif di DB kamu)
CREATE EXTENSION IF NOT EXISTS pgcrypto;