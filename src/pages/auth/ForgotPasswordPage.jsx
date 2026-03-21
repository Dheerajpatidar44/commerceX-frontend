import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] bg-hero-gradient p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CX</span>
          </div>
          <span className="font-display font-bold text-xl text-white">CommerceX Pro</span>
        </div>

        <div className="card p-8 shadow-2xl border-white/10 shadow-brand-500/10">
          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-surface-900 mb-2">Check your email</h2>
              <p className="text-sm text-surface-500 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-primary w-full justify-center"><ArrowLeft className="w-4 h-4" /> Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-display font-bold text-surface-900 mb-1">Forgot your password?</h2>
              <p className="text-sm text-surface-500 mb-6">Enter your email address and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="email" className="input-field pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center btn-lg">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1 mt-4 text-sm text-surface-500 hover:text-surface-700">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
