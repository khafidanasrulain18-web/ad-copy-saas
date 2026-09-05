import { useState } from 'react';
import { generateApi } from '../api/client';
import QuotaIndicator from '../components/QuotaIndicator';

const TONES = ['santai', 'formal', 'persuasif', 'urgent'];
const PLATFORMS = ['Instagram Ads', 'Facebook Ads', 'Google Ads', 'Umum'];

export default function Generate() {
  const [form, setForm] = useState({
    productName: '', description: '', audience: '',
    tone: 'santai', platform: 'Instagram Ads', variations: 3,
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await generateApi.create(form);
      setResults(res.data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, i) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Copy Iklan, Siap Dalam Detik
        </h1>
        <p className="text-ink-soft max-w-md mx-auto mb-5">
          Isi brief produk kamu, dapatkan beberapa variasi sekaligus.
        </p>
        <div className="flex justify-center">
          <QuotaIndicator />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nama produk/brand</label>
            <input className="input-field" value={form.productName}
              onChange={(e) => update('productName', e.target.value)} required />
          </div>
          <div>
            <label className="label">Target audiens</label>
            <input className="input-field" value={form.audience}
              onChange={(e) => update('audience', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Deskripsi singkat produk</label>
          <textarea className="input-field" rows={3} value={form.description}
            onChange={(e) => update('description', e.target.value)} required />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <select className="input-field !w-auto !py-2 rounded-full text-sm" value={form.tone}
              onChange={(e) => update('tone', e.target.value)}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input-field !w-auto !py-2 rounded-full text-sm" value={form.platform}
              onChange={(e) => update('platform', e.target.value)}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" min={1} max={5} className="input-field !w-16 !py-2 rounded-full text-sm text-center"
              value={form.variations} onChange={(e) => update('variations', e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Membuat...' : 'Generate →'}
          </button>
        </div>

        {error && (
          <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">
            {error}
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div className="mt-10">
          <p className="label mb-3 text-center">Hasil</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((text, i) => (
              <div key={i} className="card">
                <p className="text-sm text-ink whitespace-pre-line mb-3">{text}</p>
                <button onClick={() => copyToClipboard(text, i)}
                  className="text-xs font-medium text-gold hover:text-gold-dim">
                  {copiedIndex === i ? 'Tersalin ✓' : 'Salin'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}