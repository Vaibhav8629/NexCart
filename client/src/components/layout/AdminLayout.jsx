import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', to: '/admin/users', icon: Users },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="page-shell">
      <div className="dashboard-grid">
        <aside className="glass-card rounded-3xl p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-sky-300">NexCart</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Admin Panel</h2>
            </div>
            <Button variant="outline" className="lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
            <p className="mt-1 font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <Button variant="outline" className="mt-8 w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}