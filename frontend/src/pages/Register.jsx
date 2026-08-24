import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-6">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-gold bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        10 generate gratis, tiap bulan
      </div>

      <h1 className="text-3xl font-semibold mb-2">Buat akun</h1>
      <p className="text-ink-soft text-sm mb-8">Tanpa kartu kredit. Batal kapan saja.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">{error}</div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          <p className="text-xs text-ink-soft mt-1.5">Minimal 8 karakter.</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Memproses...' : 'Buat Akun'}
        </button>
      </form>

      <p className="text-sm text-ink-soft text-center mt-5">
        Sudah punya akun? <Link to="/login" className="text-gold font-medium">Masuk</Link>
      </p>
    </div>
  );
}