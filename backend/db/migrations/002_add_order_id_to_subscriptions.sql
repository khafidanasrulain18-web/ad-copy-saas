-- Kolom tambahan untuk tracking order Midtrans & mapping ke plan/harga
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS latest_order_id VARCHAR(100);