import { LayoutDashboard, ShoppingCart, TrendingUp, Package, Leaf, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface DashboardHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onExport: () => void;
  user: User;
  onLogout: () => void;
  cartCount: number;
}

export default function DashboardHeader({ currentView, onViewChange, onExport, user, onLogout, cartCount }: DashboardHeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, adminOnly: true },
    { id: 'orders', label: user.role === 'admin' ? 'Orders' : 'My Orders', icon: ShoppingCart },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, userOnly: true },
  ].filter(item => {
    if (item.adminOnly && user.role !== 'admin') return false;
    if (item.userOnly && user.role !== 'user') return false;
    return true;
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('dashboard')}>
            <div className="bg-primary p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">AgriMart</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-1 pt-1 border-b-2 transition-all ${
                  currentView === item.id 
                    ? 'text-primary font-medium border-primary' 
                    : 'text-slate-500 hover:text-primary border-transparent'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="ml-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 border-r border-slate-200 pr-6">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.displayName || 'User'}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <button 
                  onClick={onExport}
                  className="hidden sm:block bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                >
                  Export Report
                </button>
              )}
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

