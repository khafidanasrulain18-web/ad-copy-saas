import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/generate', label: 'Generate' },
  { to: '/history', label: 'History' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Blob gradient di belakang — sumber warna untuk efek kaca */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] bg-gold/25 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-teal/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] bg-gold-dim/15 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 backdrop-blur-xl bg-base/50 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            AdCopy <span className="text-gold">●</span>
          </Link>

          {user && (
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-card text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'text-gold bg-white/5'
                      : 'text-ink-soft hover:text-ink hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 rounded-card text-sm font-medium text-ink-soft hover:text-alert hover:bg-white/5 transition-colors"
              >
                Keluar
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-14 relative z-0">{children}</main>
    </div>
  );
}