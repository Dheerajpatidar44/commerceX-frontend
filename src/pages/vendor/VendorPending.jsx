import { Clock, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function VendorPending() {
  const { user, logout, syncUser } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  
  const handleCheckStatus = async () => {
    setChecking(true);
    const updatedUser = await syncUser();
    setChecking(false);
    if (updatedUser && updatedUser.approvalStatus === 'approved') {
      navigate('/vendor/dashboard');
    }
  };
  
  // If no user or they are somehow approved, just provide a link back
  if (!user || user.approvalStatus === 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-4">
        <p>Your account is active. <Link to="/vendor/dashboard" className="text-brand-600 underline">Go to Dashboard</Link></p>
      </div>
    );
  }

  const isRejected = user.approvalStatus === 'rejected';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-4 font-sans">
      <div className="card max-w-md w-full p-8 text-center space-y-6 animate-fade-in shadow-xl border border-surface-200">
        
        {/* Icon Header */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isRejected ? 'bg-red-100' : 'bg-amber-100'}`}>
          {isRejected ? (
            <ShieldAlert className="w-10 h-10 text-red-600" />
          ) : (
            <Clock className="w-10 h-10 text-amber-600" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-display font-bold text-surface-900">
          {isRejected ? 'Application Rejected' : 'Application Pending'}
        </h1>

        {/* Message Content */}
        <div className="text-surface-600 leading-relaxed text-sm">
          {isRejected ? (
            <p>
              Unfortunately, your vendor application has been <span className="font-semibold text-red-600">rejected</span> by the administration team. 
              If you believe this is a mistake, please contact support.
            </p>
          ) : (
            <p>
              Your vendor application has been received and is currently under <span className="font-semibold text-amber-600">review</span> by our administration team. 
              <br /><br />
              You will be able to access your dashboard and start selling once your account is fully approved.
            </p>
          )}
        </div>

        {/* User Info Box */}
        <div className="bg-surface-100 rounded-xl p-4 text-left">
          <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-1">Registered Details</p>
          <p className="text-sm font-medium text-surface-900">{user.storeName || 'Store Name Not Set'}</p>
          <p className="text-sm text-surface-600">{user.email}</p>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-surface-100 flex justify-center gap-4">
          <button onClick={handleCheckStatus} disabled={checking} className="btn-secondary px-6 justify-center text-surface-700">
            {checking ? 'Checking...' : 'Check Status'}
          </button>
          <button onClick={() => logout()} className="btn-ghost px-6 justify-center text-red-600 hover:bg-red-50 hover:text-red-700">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
