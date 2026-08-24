import { useEffect, useState } from 'react';
import { quotaApi } from '../api/client';

export default function QuotaIndicator() {
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    quotaApi.get().then((res) => setQuota(res.data)).catch(() => {});
  }, []);

  if (!quota) return null;

  return (
    <div className="inline-flex items-center gap-3 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-card pl-4 pr-1.5 py-1.5 mb-8">
      <span className="text-xs text-ink-soft uppercase tracking-wide">
        {quota.unlimited ? 'Paid Plan' : 'Sisa generate'}
      </span>
      <div className="font-mono text-sm text-gold bg-gold/10 px-2.5 py-0.5 rounded">
        {quota.unlimited ? '∞' : quota.remaining}
      </div>
      {!quota.unlimited && !quota.canGenerate && (
        <a href="/pricing" className="text-xs font-medium text-alert px-2">Upgrade →</a>
      )}
    </div>
  );
}