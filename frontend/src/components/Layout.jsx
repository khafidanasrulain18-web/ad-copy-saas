import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wand2, History as HistoryIcon, LayoutDashboard, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/generate', label: 'Generate', icon: Wand2 },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pricing', label: 'Pricing', icon: CreditCard },
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Blob pastel di belakang — sumber warna untuk efek kaca */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-16 w-[30rem] h-[30rem] bg-gold/40 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-20 w-[26rem] h-[26rem] bg-teal/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-5 left-3/3 w-[22rem] h-[22rem] bg-gold-dim/30 rounded-full blur-[100px]" />
      </div>

      {user && (
        <aside className="w-16 shrink-0 border-r border-white/50 bg-white/40 backdrop-blur-xl flex flex-col items-center py-5 gap-1 sticky top-0 h-screen">
          <Link to="/generate" className="w-9 h-9 rounded-xl bg-ink text-base flex items-center justify-center font-display font-bold text-sm mb-6">
            A
          </Link>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  active ? 'bg-gold/15 text-gold' : 'text-ink-soft hover:bg-white/50 hover:text-ink'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            title="Keluar"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-soft hover:bg-alert/10 hover:text-alert transition-colors mt-auto"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </aside>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-14 relative z-0">{children}</main>
    </div>
  );
}