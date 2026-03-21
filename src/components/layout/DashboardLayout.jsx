import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, ChevronDown, LogOut, User, Settings, Store } from 'lucide-react';
import Sidebar from './Sidebar';
import DashboardFooter from './DashboardFooter';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ links, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={links} title={title} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-surface-100 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/80">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-display font-semibold text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-[#131b2f] object-cover" />
                    <span className="text-sm font-medium text-white/90 hidden sm:block">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-[#131b2f] rounded-xl shadow-xl border border-white/10 py-2 animate-fade-in z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-[#131b2f] object-cover" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-surface-500 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 rounded-full">{user.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-white/10 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {(isAdmin || isVendor) && <DashboardFooter role={user.role} />}
    </div>
  );
}
