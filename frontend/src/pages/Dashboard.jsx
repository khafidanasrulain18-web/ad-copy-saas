import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-alert">{error}</p>;
  if (!data) return <p className="text-ink-soft">Memuat dashboard...</p>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="label">Plan</p>
          <p className="text-2xl font-display">{data.plan === 'paid' ? 'Paid' : 'Free'}</p>
        </div>
        <div className="card">
          <p className="label">Sisa Quota</p>
          <p className="text-2xl font-mono text-gold">{data.quota.unlimited ? '∞' : data.quota.remaining}</p>
        </div>
        <div className="card">
          <p className="label">Total Generate</p>
          <p className="text-2xl font-mono">{data.totalGenerateAllTime}</p>
        </div>
      </div>

      {data.subscription?.current_period_end && (
        <p className="text-sm text-ink-soft mt-8">
          Subscription berlaku sampai{' '}
          <span className="text-ink font-medium">
            {new Date(data.subscription.current_period_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </p>
      )}
    </div>
  );
}