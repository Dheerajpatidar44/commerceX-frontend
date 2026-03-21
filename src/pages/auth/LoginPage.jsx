import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const doLogin = async (email, password) => {
    setError('');
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields are required'); return; }
    doLogin(form.email, form.password);
  };

  const quickLogin = (email, password) => {
    setForm({ email, password });
    doLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 overflow-hidden relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 lg:top-10 lg:left-10 p-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-full transition-all shadow-lg border border-white/5 z-50 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="w-full max-w-[850px] bg-[#1e293b] rounded-[32px] shadow-2xl overflow-hidden flex min-h-[550px] relative z-10 border border-white/5">
        {/* Left Image Section */}
        <div className="hidden lg:block w-1/2 p-3">
          <div className="w-full h-full relative rounded-[24px] overflow-hidden">
            <img src="https://plus.unsplash.com/premium_photo-1683288662050-a0c17370365d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="VR Background" className="w-full h-full object-cover" />

            <div className="absolute top-10 w-full flex justify-center text-white">
              <span className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-lg">
                CommerceX <span className="text-sm font-medium opacity-80 ml-1">pro</span>
              </span>
            </div>

            <div className="absolute bottom-12 left-8 right-8 text-blue-500">
              <h2 className="text-3xl font-display font-bold mb-2 leading-tight">Welcome to the<br /><span className="text-white">future of commerce</span></h2>
              <p className="text-sm text-white/80 font-medium">Log in securely and seamlessly.</p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:px-12 sm:py-10 flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold mb-1.5 text-white tracking-tight">Log in</h1>
          <p className="text-xs font-medium text-gray-300 mb-8">
            Don't have an account? <Link to="/register" className="text-[#60a5fa] font-bold hover:text-[#3b82f6] transition-colors">Create an Account</Link>
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 px-1">Email Address</label>
              <input type="email" placeholder="john.doe@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-[#334155] border-none rounded-full px-5 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all font-medium shadow-inner" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 px-1">Password</label>
              <div className="relative group">
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-[#334155] border-none rounded-full px-5 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all font-medium pr-12 shadow-inner" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-3 px-1">
                <label className="flex items-center gap-2 cursor-pointer group pb-1">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-white text-[#2563eb] focus:ring-[#2563eb] bg-white accent-[#2563eb] cursor-pointer" />
                  <span className="text-[11px] text-gray-200 font-medium group-hover:text-white transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#60a5fa] hover:text-[#3b82f6] transition-colors">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold tracking-wide rounded-full py-3.5 text-sm transition-all flex items-center justify-center mt-5 h-[46px] shadow-lg shadow-blue-500/30">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 before:h-[1px] before:flex-1 before:bg-gray-600 after:h-[1px] after:flex-1 after:bg-gray-600">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quick Login</span>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={() => quickLogin('user@demo.com', 'demo123')} className="flex-1 flex justify-center py-2 bg-[#334155] rounded-full text-[11px] font-bold text-white hover:bg-[#475569] transition-colors shadow-sm border border-gray-600">
              User
            </button>
            <button onClick={() => quickLogin('vendor@demo.com', 'demo123')} className="flex-1 flex justify-center py-2 bg-[#334155] rounded-full text-[11px] font-bold text-white hover:bg-[#475569] transition-colors shadow-sm border border-gray-600">
              Vendor
            </button>
            <button onClick={() => quickLogin('admin@demo.com', 'demo123')} className="flex-1 flex justify-center py-2 bg-[#334155] rounded-full text-[11px] font-bold text-white hover:bg-[#475569] transition-colors shadow-sm border border-gray-600">
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
