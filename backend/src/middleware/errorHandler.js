// Global error handler — jaring pengaman terakhir kalau ada error yang
// tidak ke-catch di route manapun. Ditaruh PALING BAWAH di server.js.
export function errorHandler(err, req, res, next) {
  console.error('🔴 Unhandled error:', err.stack || err.message);

  // Jangan pernah bocorkan stack trace / detail internal ke client
  res.status(err.status || 500).json({
    success: false,
    message: 'Terjadi kesalahan pada server.',
    data: null,
  });
}

// Handler untuk route yang tidak ditemukan (404)
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
    data: null,
  });
}