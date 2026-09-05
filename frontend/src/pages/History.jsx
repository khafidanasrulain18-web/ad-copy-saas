import { useEffect, useState } from 'react';
import { historyApi } from '../api/client';
import { exportHistoryItemPdf, exportAllHistoryPdf } from '../utils/pdf';

export default function History() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    historyApi.list({ page, limit: 10 })
      .then((res) => { setItems(res.data.items); setPagination(res.data.pagination); })
      .catch((err) => setError(err.message));
  }, [page]);

  if (error) return <p className="text-alert">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">History</h1>
        {items.length > 0 && (
          <button onClick={() => exportAllHistoryPdf(items)} className="btn-secondary text-sm px-4 py-2">
            Export Semua (PDF)
          </button>
        )}
      </div>

      {items.length === 0 && (
        <div className="text-sm text-ink-soft border border-dashed border-border rounded-card p-8 text-center">
          Belum ada history generate.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{item.input_brief?.productName}</p>
              <p className="text-xs text-ink-soft font-mono">
                {new Date(item.generated_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <p className="text-xs text-ink-soft mb-3">{item.input_brief?.platform} · {item.input_brief?.tone}</p>
            <div className="space-y-2 mb-3">
                {(item.output_results || []).map((text, i) => (
                <p key={i} className="text-sm text-ink-soft bg-white/30 backdrop-blur-sm border border-white/50 rounded-lg px-3 py-2">{text}</p>
              ))}
            </div>
            <button onClick={() => exportHistoryItemPdf(item)} className="text-xs font-medium text-gold hover:text-gold-dim">
              Unduh PDF
            </button>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm px-3 py-1.5">
            ← Sebelumnya
          </button>
          <span className="text-sm text-ink-soft font-mono">{pagination.page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm px-3 py-1.5">
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}