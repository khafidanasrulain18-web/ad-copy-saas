import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-semibold mb-2">Lupa Password</h1>
      <p className="text-ink-soft text-sm mb-8">Masukkan email akun kamu, kami kirim kode reset.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">{error}</div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
        </button>
      </form>

      <p className="text-sm text-ink-soft text-center mt-5">
        Ingat password? <Link to="/login" className="text-gold font-medium">Masuk</Link>
      </p>
    </div>
  );
}