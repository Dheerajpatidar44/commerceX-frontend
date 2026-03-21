import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 overflow-hidden relative"
    >
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 lg:top-10 lg:left-10 p-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-full transition-all shadow-lg border border-white/5 z-50 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="w-full max-w-[850px] bg-[#1e293b] rounded-[32px] shadow-2xl overflow-hidden flex min-h-[550px] relative z-10 border border-white/5">
        {/* Left Image Section */}
        <div className="hidden lg:block w-1/2 p-3 group cursor-pointer">
          <div className="w-full h-full relative rounded-[24px] overflow-hidden shadow-2xl">
            <img
              src="../src/assests/login2.png"
              alt="VR Background"
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

            <div className="absolute top-10 w-full flex justify-center text-white transform transition-transform duration-500 group-hover:-translate-y-1">
              <span className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                CommerceX <span className="text-sm font-medium opacity-80 ml-1">pro</span>
              </span>
            </div>

            <div className="absolute bottom-12 left-8 right-8 text-white transform transition-all duration-500 group-hover:-translate-y-2">
              <h2 className="text-3xl font-display font-bold mb-2 leading-tight drop-shadow-lg">
                Welcome to the<br />
                <span className="text-blue-500">future of commerce</span>
              </h2>
              <p className="text-sm text-white/80 font-medium group-hover:text-white transition-colors">
                Log in securely and seamlessly.
              </p>
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

        </div>
      </div>
    </motion.div>
  );
}
