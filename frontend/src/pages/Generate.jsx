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
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 max-w-lg">
        Copy iklan yang siap tayang, dalam hitungan detik.
      </h1>
      <p className="text-ink-soft mb-8 max-w-md">Isi brief produk kamu, dapatkan beberapa variasi sekaligus.</p>

      <QuotaIndicator />

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
          <div>
            <label className="label">Nama produk/brand</label>
            <input className="input-field" value={form.productName}
              onChange={(e) => update('productName', e.target.value)} required />
          </div>
          <div>
            <label className="label">Deskripsi singkat produk</label>
            <textarea className="input-field" rows={3} value={form.description}
              onChange={(e) => update('description', e.target.value)} required />
          </div>
          <div>
            <label className="label">Target audiens</label>
            <input className="input-field" value={form.audience}
              onChange={(e) => update('audience', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tone</label>
              <select className="input-field" value={form.tone} onChange={(e) => update('tone', e.target.value)}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Platform</label>
              <select className="input-field" value={form.platform} onChange={(e) => update('platform', e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Jumlah variasi (1–5)</label>
            <input type="number" min={1} max={5} className="input-field w-24" value={form.variations}
              onChange={(e) => update('variations', e.target.value)} />
          </div>

          {error && (
            <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Membuat...' : 'Generate Copy'}
          </button>
        </form>

        <div className="space-y-3">
          {results.length === 0 && !loading && (
            <div className="text-sm text-ink-soft border border-dashed border-border rounded-card p-8 text-center">
              Hasil generate akan muncul di sini.
            </div>
          )}
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
    </div>
  );
}