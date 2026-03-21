import { useState } from 'react';
import { Globe, Mail, MessageSquare, DollarSign, CheckCircle, AlertTriangle, Settings, RefreshCw, Loader2, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const apiServices = [
  { id: 'shipping', name: 'Shipping API', desc: 'ShipRocket — Track & manage shipments', icon: Globe, color: 'brand', status: 'connected', lastSync: '2 mins ago', endpoint: 'https://api.shiprocket.in/v1' },
  { id: 'email', name: 'Email API', desc: 'SendGrid — Transactional & marketing emails', icon: Mail, color: 'green', status: 'connected', lastSync: '5 mins ago', endpoint: 'https://api.sendgrid.com/v3' },
  { id: 'sms', name: 'SMS API', desc: 'Twilio — OTP & notifications', icon: MessageSquare, color: 'purple', status: 'error', lastSync: '1 hour ago', endpoint: 'https://api.twilio.com/2010-04-01' },
  { id: 'currency', name: 'Currency API', desc: 'Open Exchange Rates — Currency conversion', icon: DollarSign, color: 'accent', status: 'disconnected', lastSync: 'Never', endpoint: 'https://openexchangerates.org/api' },
];

export default function AdminAPISettings() {
  const toast = useToast();
  const [services, setServices] = useState(apiServices);
  const [testingId, setTestingId] = useState(null);

  const statusConfig = {
    connected: { badge: 'badge-green', icon: CheckCircle, label: 'Connected' },
    error: { badge: 'badge-red', icon: AlertTriangle, label: 'Error' },
    disconnected: { badge: 'badge-gray', icon: XCircle, label: 'Disconnected' },
  };

  const handleTest = async (id) => {
    setTestingId(id);
    await new Promise(r => setTimeout(r, 1500));
    const success = Math.random() > 0.3;
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: success ? 'connected' : 'error', lastSync: 'Just now' } : s));
    setTestingId(null);
    if (success) toast.success('API connection successful!');
    else toast.error('API connection failed — check your credentials');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">API Settings & Integrations</h1>
        <p className="page-subtitle">Configure third-party services and monitor connection health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(s => {
          const cfg = statusConfig[s.status];
          return (
            <div key={s.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color === 'brand' ? 'bg-brand-100 text-brand-600' : s.color === 'green' ? 'bg-emerald-100 text-emerald-600' : s.color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-accent-100 text-accent-600'}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={cfg.badge}><cfg.icon className="w-3 h-3" /> {cfg.label}</span>
              </div>
              <h3 className="font-semibold text-sm text-surface-900 mb-1">{s.name}</h3>
              <p className="text-xs text-surface-500 mb-2">{s.desc}</p>
              <p className="text-[10px] text-surface-400 mb-3">Last sync: {s.lastSync}</p>
              <button onClick={() => handleTest(s.id)} disabled={testingId === s.id} className="btn-secondary btn-sm w-full justify-center">
                {testingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {testingId === s.id ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          );
        })}
      </div>

      {/* API Configuration */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-brand-600" />
          <h3 className="font-display font-semibold text-lg text-surface-900">API Configuration</h3>
        </div>
        <div className="space-y-4">
          {services.map(s => (
            <div key={s.id} className="p-4 rounded-xl border border-surface-200 bg-surface-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-surface-900">{s.name}</p>
                  <p className="text-xs text-surface-500 font-mono mt-0.5">{s.endpoint}</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="API Key" className="input-field py-1.5 px-3 text-xs w-48" defaultValue="••••••••••••••••" />
                  <button onClick={() => toast.info(`${s.name} settings saved`)} className="btn-primary btn-sm">Save</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Handling */}
      {services.some(s => s.status === 'error') && (
        <div className="card p-5 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Integration Errors Detected</p>
              <p className="text-sm text-red-700 mt-1">
                {services.filter(s => s.status === 'error').map(s => s.name).join(', ')} — Please check your API credentials and try reconnecting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
