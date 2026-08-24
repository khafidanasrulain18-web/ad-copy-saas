-- Tambah kolom untuk simpan input brief & output hasil generate,
-- supaya history bisa ditampilkan lengkap, bukan cuma metadata.
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS input_brief JSONB;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS output_results JSONB;