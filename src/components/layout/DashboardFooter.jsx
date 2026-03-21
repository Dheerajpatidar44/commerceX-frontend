import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function DashboardFooter({ role }) {
  const isVendor = role === 'vendor';
  const isAdmin = role === 'admin';

  const config = {
    vendor: {
      buttonLabel: 'Vendor Dashboard',
      buttonColor: 'bg-[#00b65e] hover:bg-[#00a052] shadow-[#00b65e]/20',
      buttonLink: '/vendor/dashboard',
      cardTitle: 'Vendor Dashboard',
      items: [
        'Product Upload & Edit',
        'Order & Delivery Tracking',
        'Sales & Profit Analytics',
        'Wallet & Settlement'
      ]
    },
    admin: {
      buttonLabel: 'Admin Panel',
      buttonColor: 'bg-[#3b82f6] hover:bg-[#2563eb] shadow-[#3b82f6]/20',
      buttonLink: '/admin/dashboard',
      cardTitle: 'System Access',
      items: [
        'Platform Management',
        'Vendor Control',
        'Orders & Revenue',
        'System Security'
      ]
    }
  };

  const current = config[role] || config.vendor;

  return (
    <footer className="bg-[#0a0f1c] text-white border-t border-white/5 pt-12 pb-6 mt-auto w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-display font-bold">CommerceX</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Smart, secure & scalable multi-vendor eCommerce platform built for performance and growth.
            </p>
            <Link
              to={current.buttonLink}
              className={`inline-flex items-center px-6 py-2 ${current.buttonColor} text-white text-sm font-semibold rounded-full transition-all active:scale-95 shadow-lg`}
            >
              {current.buttonLabel}
            </Link>
          </div>

          {/* Features Section */}
          <div className="bg-[#131b2f]/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm self-start">
            <h3 className="text-lg font-semibold mb-6">{current.cardTitle}</h3>
            <ul className="space-y-4">
              {current.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70 text-sm group cursor-default">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-6 md:pl-8">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-white/40" />
                <span>admin@commercex.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-white/40" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-white/30 text-xs">
            © 2026 CommerceX — Powered by Secure Commerce Engine
          </p>
        </div>
      </div>
    </footer>
  );
}
