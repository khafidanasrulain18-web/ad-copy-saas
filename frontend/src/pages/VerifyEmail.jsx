import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeVerification } = useAuth();

  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    // Halaman ini butuh konteks email dari register/login — kalau diakses langsung, arahkan balik
    return (
      <div className="max-w-sm mx-auto mt-10 text-center">
        <p className="text-ink-soft mb-4">Tidak ada email yang perlu diverifikasi.</p>
        <Link to="/register" className="text-gold font-medium">Daftar akun baru</Link>
      </div>
    );
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, code);
      completeVerification(res.data.token, res.data.user);
      navigate('/generate');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      await authApi.resendOtp(email);
      setInfo('Kode baru sudah dikirim.');
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-semibold mb-2">Verifikasi Email</h1>
      <p className="text-ink-soft text-sm mb-8">
        Kode 6 digit sudah dikirim ke <span className="text-ink">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="card space-y-4">
        {error && <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-card px-3 py-2">{error}</div>}
        {info && <div className="text-sm text-teal bg-teal/10 border border-teal/20 rounded-card px-3 py-2">{info}</div>}

        <div>
          <label className="label">Kode Verifikasi</label>
          <input
            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            autoFocus
            required
          />
        </div>

        <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">
          {loading ? 'Memverifikasi...' : 'Verifikasi'}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="text-sm text-ink-soft hover:text-gold disabled:opacity-40 mt-5 mx-auto block"
      >
        {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim ulang kode'}
      </button>
    </div>
  );
}