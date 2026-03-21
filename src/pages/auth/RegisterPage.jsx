import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', agreeTerms: false, storeName: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.role === 'vendor' && !form.storeName.trim()) { setError('Store Name is required to become a seller'); return; }
    if (!form.agreeTerms) { setError('You must agree to the Terms & Conditions'); return; }

    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
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

            <div className="absolute bottom-12 left-8 right-8 text-white">
              <h2 className="text-3xl font-display font-bold mb-2 leading-tight">Join the<br /><span className="text-white">commerce revolution</span></h2>
              <p className="text-sm text-white/80 font-medium">Create your account to get started.</p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:px-12 sm:py-10 flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold mb-1.5 text-white tracking-tight">Create an Account</h1>
          <p className="text-xs font-medium text-gray-300 mb-6">
            Already have an account? <Link to="/login" className="text-[#60a5fa] font-bold hover:text-[#3b82f6] transition-colors">Log in</Link>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 px-1">Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#334155] border-none rounded-full px-5 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all font-medium shadow-inner" />
            </div>

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
            </div>

            <div className="pt-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 px-1">Account Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(prev => ({ ...prev, role: 'user' }))} className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] font-bold rounded-full transition-all border ${form.role === 'user' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md' : 'bg-[#334155] border-gray-600 text-white hover:bg-[#475569]'}`}>
                  User
                </button>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, role: 'vendor' }))} className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] font-bold rounded-full transition-all border ${form.role === 'vendor' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md' : 'bg-[#334155] border-gray-600 text-white hover:bg-[#475569]'}`}>
                  Vendor
                </button>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, role: 'admin' }))} className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] font-bold rounded-full transition-all border ${form.role === 'admin' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md' : 'bg-[#334155] border-gray-600 text-white hover:bg-[#475569]'}`}>
                  Admin
                </button>
              </div>
            </div>

            {form.role === 'vendor' && (
              <div className="pt-1 animate-fade-in">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 px-1">Your Store Name</label>
                <input type="text" placeholder="My Awesome Shop" value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="w-full bg-[#334155] border-none rounded-full px-5 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all font-medium shadow-inner" />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer pt-3 group px-1">
              <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-white text-[#2563eb] focus:ring-[#2563eb] bg-white accent-[#2563eb] cursor-pointer" checked={form.agreeTerms} onChange={e => setForm(prev => ({ ...prev, agreeTerms: e.target.checked }))} />
              <span className="text-[11px] text-gray-200 font-medium group-hover:text-white transition-colors">I agree to the <a href="#" className="text-[#60a5fa] font-bold hover:text-[#3b82f6]">Terms & Condition</a></span>
            </label>

            <button type="submit" disabled={isLoading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold tracking-wide rounded-full py-3.5 text-sm transition-all flex items-center justify-center mt-4 h-[46px] shadow-lg shadow-blue-500/30">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
