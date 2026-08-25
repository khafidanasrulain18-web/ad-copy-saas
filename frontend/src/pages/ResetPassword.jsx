import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/client';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <div className="max-w-sm mx-auto mt-10 text-center">
        <p className="text-ink-soft mb-4">Tidak ada permintaan reset password aktif.</p>
        <Link to="/forgot-password" className="text-gold font-medium">Mulai dari awal</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
      <p className="text-ink-soft text-sm mb-8">
        Kode sudah dikirim ke <span className="text-ink">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">{error}</div>}
        {success && (
          <div className="text-sm text-teal bg-teal/10 border border-teal/20 rounded-card px-3 py-2">
            Password berhasil diganti. Mengarahkan ke halaman login...
          </div>
        )}

        <div>
          <label className="label">Kode Verifikasi</label>
          <input
            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            required
          />
        </div>
        <div>
          <label className="label">Password Baru</label>
          <input
            type="password"
            className="input-field"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">
          {loading ? 'Memproses...' : 'Ganti Password'}
        </button>
      </form>
    </div>
  );
}