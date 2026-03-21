import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CX</span>
              </div>
              <span className="font-display font-bold text-xl text-white">CommerceX <span className="text-xs font-medium text-surface-400">Pro</span></span>
            </div>
            <p className="text-sm text-surface-400 mb-4">Your premium marketplace for everything. Shop from trusted vendors with confidence.</p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:bg-brand-600 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: 'Cart', to: '/cart' }, { label: 'Wishlist', to: '/wishlist' }, { label: 'Orders', to: '/orders' }].map(link => (
                <li key={link.to}><Link to={link.to} className="text-sm hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'].map(cat => (
                <li key={cat}><Link to={`/products?category=${cat}`} className="text-sm hover:text-white transition-colors">{cat}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-surface-500" /> 123 Commerce Street, Tech Park, Bangalore - 560001</li>
              <li className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 flex-shrink-0 text-surface-500" /> +91 98765 43210</li>
              <li className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 flex-shrink-0 text-surface-500" /> support@commercex.pro</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">© 2024 CommerceX Pro. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-surface-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
