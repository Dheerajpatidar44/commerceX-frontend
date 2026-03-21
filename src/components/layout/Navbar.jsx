import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/axios';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (data.success) {
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setMobileOpen(false);
    navigate(`/product/${productId}`);
  };

  const isAdminOrVendor = user && (user.role === 'admin' || user.role === 'vendor');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'vendor') return '/vendor/dashboard';
    return '/orders';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/10 shadow-sm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdminOrVendor ? getDashboardLink() : "/"} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CX</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:block text-white">
              Commerce<span className="text-gradient">X</span> <span className="text-xs font-medium text-white/50">Pro</span>
            </span>
          </Link>

          {/* Search Bar */}
          {!isAdminOrVendor && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6" ref={desktopSearchRef}>
              <div className="relative w-full text-white">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSuggestions && e.target.value.trim().length > 0) setShowSuggestions(true);
                  }}
                  onFocus={() => { if (searchQuery.trim().length > 0) setShowSuggestions(true); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#131b2f] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder-white/40"
                />

                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-[#131b2f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-white/5">
                    {loadingSuggestions ? (
                      <div className="p-4 text-center text-sm text-white/50">Loading...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map(p => (
                        <div key={p._id} onClick={() => handleSuggestionClick(p._id)} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors">
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">{p.name}</p>
                            <p className="text-xs text-brand-400 font-semibold">₹{p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-white/50">No products found</div>
                    )}
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-1">
            {!isAdminOrVendor && (
              <>
                <Link to="/wishlist" className="relative p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[#131b2f]" />
                  <span className="text-sm font-medium hidden lg:block">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#131b2f] rounded-xl shadow-2xl border border-white/10 py-2 animate-fade-in text-white z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-white/50">{user.email}</p>
                      <span className="badge-blue mt-1 capitalize">{user.role}</span>
                    </div>

                    {!isAdminOrVendor && (
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition-colors">
                        <Package className="w-4 h-4 text-white/70" /> My Orders
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0f1c] animate-fade-in text-white">
          {!isAdminOrVendor && (
            <>
              <form onSubmit={handleSearch} className="px-4 py-3" ref={mobileSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!showSuggestions && e.target.value.trim().length > 0) setShowSuggestions(true);
                    }}
                    onFocus={() => { if (searchQuery.trim().length > 0) setShowSuggestions(true); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#131b2f] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-white/40"
                  />

                  {showSuggestions && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-[#131b2f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                      {loadingSuggestions ? (
                        <div className="p-4 text-center text-sm text-white/50">Loading...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map(p => (
                          <div key={p._id} onClick={() => handleSuggestionClick(p._id)} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors">
                            <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-white">{p.name}</p>
                              <p className="text-xs text-brand-400 font-semibold">₹{p.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-white/50">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              </form>
              <div className="px-4 pb-4 space-y-1">
                <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10">All Products</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10">
                  Wishlist {wishlistCount > 0 && <span className="badge-red">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10">
                  Cart {cartCount > 0 && <span className="badge-blue">{cartCount}</span>}
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10">My Orders</Link>
                <hr className="border-white/10" />
              </div>
            </>
          )}
          <div className="px-4 pb-4 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10">Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1 text-center bg-[#131b2f] text-white border-white/10 hover:bg-white/10 hover:text-white">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
