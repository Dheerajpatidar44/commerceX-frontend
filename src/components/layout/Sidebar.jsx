import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ links, title, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-surface-100 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CX</span>
            </div>
            <span className="font-display font-semibold text-base">{title}</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 text-surface-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-5 py-4 border-b border-surface-100">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-surface-100" />
              <div>
                <p className="text-sm font-semibold text-surface-900">{user.name}</p>
                <p className="text-xs text-surface-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }
            >
              {link.icon && <link.icon className="w-5 h-5" />}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-100">
          <button onClick={handleLogout} className="sidebar-link-inactive w-full text-red-500 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
