import { useEffect, useState } from 'react';
import { subscriptionApi } from '../api/client';

export default function Pricing() {
  const [plans, setPlans] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subscriptionApi.plans().then((res) => setPlans(res.data)).catch((err) => setError(err.message));
  }, []);

  async function handleUpgrade(planId) {
    setLoading(true);
    setError('');
    try {
      const res = await subscriptionApi.checkout(planId);
      window.snap.pay(res.data.snapToken, {
        onSuccess: () => window.location.reload(),
        onPending: () => alert('Pembayaran pending, cek email untuk instruksi selanjutnya.'),
        onError: () => setError('Pembayaran gagal, silakan coba lagi.'),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-semibold mb-2">Pricing</h1>
      <p className="text-ink-soft text-sm mb-8">Generate tanpa batas, kapan saja.</p>

      {error && (
        <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {Object.entries(plans).map(([planId, plan]) => (
        <div key={planId} className="card border-gold/30">
          <p className="label">{plan.name}</p>
          <p className="text-4xl font-display mb-6">
            Rp{plan.price.toLocaleString('id-ID')}
            <span className="text-sm text-ink-soft font-body"> / bulan</span>
          </p>
          <button disabled={loading} onClick={() => handleUpgrade(planId)} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Upgrade Sekarang'}
          </button>
        </div>
      ))}
    </div>
  );
}