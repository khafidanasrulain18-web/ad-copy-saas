import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    title: 'Multi-platform',
    desc: 'Satu brief, hasil copy yang disesuaikan gaya Instagram Ads, Facebook Ads, atau Google Ads.',
  },
  {
    title: 'Beberapa variasi sekaligus',
    desc: 'Generate 1–5 variasi copy dalam satu kali klik, tinggal pilih yang paling pas.',
  },
  {
    title: '10 generate gratis / bulan',
    desc: 'Coba dulu tanpa kartu kredit. Upgrade kapan saja kalau butuh unlimited.',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/generate');
    } catch (err) {
      if (err.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: err.data.email || email } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-16 items-start">
      {/* ── Kolom kiri: hero + fitur ── */}
      <div className="pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-teal bg-teal/10 border border-teal/20 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
          Ditenagai GPT-4o mini
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
          Berhenti nulis
          <br />
          copy iklan dari nol.
        </h1>

        <p className="text-ink-soft text-lg max-w-md mb-12">
          Isi brief produk kamu, dapatkan copy iklan siap tayang untuk Instagram, Facebook, dan Google Ads
          dalam hitungan detik.
        </p>

        <div className="space-y-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card !p-5 flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
              <div>
                <p className="font-medium text-ink mb-1">{f.title}</p>
                <p className="text-sm text-ink-soft">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kolom kanan: form login ── */}
      <div className="lg:sticky lg:top-28">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-1">Masuk</h2>
          <p className="text-ink-soft text-sm mb-6">Lanjut bikin copy iklan.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
                    <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <div className="text-right mt-1.5">
            <Link to="/forgot-password" className="text-xs text-ink-soft hover:text-gold">Lupa password?</Link>
          </div>
        </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-sm text-ink-soft text-center mt-5">
            Belum punya akun?{' '}
            <Link to="/register" className="text-gold font-medium">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}