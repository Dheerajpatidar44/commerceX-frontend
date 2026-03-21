import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, CreditCard, Star, TrendingUp, Zap, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/common/Loader';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock vendors for LG and Samsung as requested
  const mockVendors = [
    {
      _id: 'mock-lg',
      name: 'Life\'s Good',
      storeName: 'LG Official Store',
      storeDescription: 'Discover the latest in premium home appliances and innovative electronics. Innovation for a better life.',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRraVvIfk4RZE6AyAWJXI-LBnQTaO48xIV4zQ&s',
    },
    {
      _id: 'mock-samsung',
      name: 'Samsung Electronics',
      storeName: 'Samsung Galaxy Hub',
      storeDescription: 'Explore the universe of Galaxy. From flagship smartphones to stunning QLED TVs, experience our newest tech.',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHN9q5atDaC8ggdoFnpaT2kiXQM9KHr5LnfA&s',
    }
  ];

  const heroSlides = [
    {
      id: 1,
      title: 'Shop Premium.',
      highlight: 'Live Premium.',
      subtitle: 'Discover thousands of products from trusted vendors. Fast delivery, secure payments, and exceptional quality.',
      image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      primaryAction: { label: 'Shop Now', link: '/products' },
      secondaryAction: { label: 'Become a Seller', link: '/register' },
      badge: 'Flash Sale — Up to 60% OFF'
    },
    {
      id: 2,
      title: 'Next Gen Tech',
      highlight: 'Is Here.',
      subtitle: 'Upgrade your lifestyle with our latest collection of premium electronics and smart devices available today.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1920',
      primaryAction: { label: 'Explore Tech', link: '/products?category=Electronics' },
      secondaryAction: null,
      badge: 'New Arrivals'
    },
    {
      id: 3,
      title: 'Elevate Your',
      highlight: 'Style.',
      subtitle: 'Discover the latest fashion trends and accessories. Premium quality, unmatched comfort, delivered to your door.',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920',
      primaryAction: { label: 'Shop Fashion', link: '/products?category=Fashion' },
      secondaryAction: null,
      badge: 'Trending Collection'
    },
    {
      id: 4,
      title: 'Upgrade Your',
      highlight: 'Gadgets.',
      subtitle: 'Explore cutting-edge electronics and smart devices. Innovation meets performance at unbeatable prices.',
      image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=1326&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      primaryAction: { label: 'Shop Electronics', link: '/products?category=Electronics' },
      secondaryAction: null,
      badge: 'New Arrivals'
    },
    {
      id: 5,
      title: 'Transform Your',
      highlight: 'Home.',
      subtitle: 'Modern furniture and decor to make your home stylish and comfortable. Designed for everyday living.',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1920',
      primaryAction: { label: 'Shop Home', link: '/products?category=Home' },
      secondaryAction: null,
      badge: 'Best Sellers'
    },
    {
      id: 6,
      title: 'Level Up Your',
      highlight: 'Fitness.',
      subtitle: 'High-quality fitness gear and accessories to keep you active and strong. Stay fit, stay confident.',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1920',
      primaryAction: { label: 'Shop Fitness', link: '/products?category=Fitness' },
      secondaryAction: null,
      badge: 'Hot Deals'
    },
    {
      id: 7,
      title: 'Wear Your',
      highlight: 'Confidence.',
      subtitle: 'From casual to classy, find outfits that match your vibe and elevate your confidence.',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1920',
      primaryAction: { label: 'Discover Now', link: '/products?category=Fashion' },
      secondaryAction: null,
      badge: 'Top Picks'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide(prev => prev === 0 ? heroSlides.length - 1 : prev - 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, vRes] = await Promise.all([
          api.get('/products?limit=20'),
          api.get('/products/meta/categories'),
          api.get('/products/meta/vendors')
        ]);
        setProducts(pRes.data.products);
        setCategories(cRes.data.categories);
        setVendors([...mockVendors, ...(vRes.data.vendors || [])]);
      } catch (err) {
        console.error('Home data fetch failed', err);
        setVendors(mockVendors);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const trending = products
    .filter(p => !featured.find(f => f._id === p._id))
    .slice(0, 4);
  const deals = products.filter(p => p.originalPrice && ((p.originalPrice - p.price) / p.originalPrice) > 0.2).slice(0, 4);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="bg-[#0a0f1c] min-h-screen text-white">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden h-[600px] lg:h-[700px] flex items-center justify-center bg-[#0a0f1c] group">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 bg-[#0a0f1c]">
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover origin-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c]/95 via-[#0a0f1c]/80 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c]/80 via-transparent to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center pb-12">
              <div className={`max-w-2xl transform transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-white/90 mb-6 border border-white/20">
                  <Zap className="w-3.5 h-3.5 text-accent-400" /> {slide.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
                  {slide.title}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-yellow-300 drop-shadow-sm">
                    {slide.highlight}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl font-medium drop-shadow leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={slide.primaryAction.link} className="btn bg-white text-brand-700 hover:bg-surface-50 font-semibold px-8 py-4 shadow-xl text-base">
                    {slide.primaryAction.label} <ArrowRight className="w-5 h-5 ml-1" />
                  </Link>
                  {slide.secondaryAction && (
                    <Link to={slide.secondaryAction.link} className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-base backdrop-blur-sm">
                      {slide.secondaryAction.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute inset-0 z-20 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button onClick={prevSlide} className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-12">
        <div className="bg-[#131b2f] rounded-3xl border border-white/10 p-8 sm:p-10 shadow-lg transition-shadow duration-300 w-full overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₹499' },
              { icon: ShieldCheck, label: 'Secure Payment', desc: '100% safe checkout' },
              { icon: CreditCard, label: 'Easy Returns', desc: '30-day return policy' },
              { icon: Star, label: '24/7 Support', desc: 'Dedicated help center' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:-translate-y-1 group-hover:bg-brand-500/30 group-hover:text-brand-300 transition-all duration-300 border border-brand-500/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors whitespace-nowrap">{label}</p>
                  <p className="text-xs text-white/50 whitespace-nowrap">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Continuous Marquee Slider */}
      <section className="max-w-[100vw] overflow-hidden py-8 mb-8 bg-[#0a0f1c] border-y border-white/5 relative z-10">
        <div className="text-center flex flex-col items-center mb-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-display font-bold text-white">Shop by Category</h2>
          <p className="text-sm text-white/60 mt-2 max-w-md">Explore our wide range of premium collections handpicked just for you</p>
        </div>

        <div className="relative flex overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0f1c] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0f1c] to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-infinite-slider hover:[animation-play-state:paused] gap-4 sm:gap-6 px-4">
            {/* We map the array twice to create a seamless infinite loop */}
            {[
              ...Array.from(new Set([...categories, 'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Grocery', 'Jewelry', 'Pet Supplies'])),
              ...Array.from(new Set([...categories, 'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Grocery', 'Jewelry', 'Pet Supplies']))
            ].map((cat, idx) => (
              <Link key={`${cat}-${idx}`} to={`/products?category=${encodeURIComponent(cat)}`} className="shrink-0 w-[220px] sm:w-[240px] h-[130px] sm:h-[140px] group flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] bg-[#131b2f] border border-white/10 shadow-lg hover:shadow-2xl hover:border-brand-500/50 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden relative">
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="text-4xl group-hover:scale-110 transition-transform duration-500 z-10">
                  {cat === 'Electronics' ? '🔌' : 
                   cat === 'Fashion' ? '👕' : 
                   cat === 'Home & Kitchen' ? '🏠' : 
                   cat === 'Books' ? '📚' : 
                   cat === 'Sports' ? '⚽' : 
                   cat === 'Beauty' ? '💄' : 
                   cat === 'Toys' ? '🧸' : 
                   cat === 'Automotive' ? '🚗' : 
                   cat === 'Health' ? '🏥' : 
                   cat === 'Grocery' ? '🥦' : 
                   cat === 'Jewelry' ? '💎' : '🛒'}
                </div>
                <span className="text-sm font-bold text-white/90 text-center group-hover:text-white transition-colors z-10 px-2 line-clamp-1">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10 relative">
          <h2 className="text-3xl font-display font-bold text-white">Featured Products</h2>
          <p className="text-sm text-white/50 mt-2">Handpicked premium products just for you</p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
            <Link to="/products" className="text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.map(p => <ProductCard key={p._id} product={p} isDark={true} />)}
        </div>
      </section>

      {/* Deals Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 grid grid-cols-1 md:grid-cols-2 group shadow-[0_0_40px_rgba(30,58,138,0.2)] border border-white/10">
          <div className="relative p-8 lg:p-16 z-10 flex flex-col justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/95 to-transparent z-0" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-xs font-bold text-accent-400 mb-6 backdrop-blur shadow-inner">
                <Zap className="w-3.5 h-3.5" /> LIMITED TIME OFFER
              </span>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight">
                Premium Deals<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-yellow-300">Up to 60% OFF</span>
              </h2>
              <p className="text-white/70 mb-8 text-lg">Don't miss out on our biggest sale of the season. Grab the best premium products before they're gone.</p>
              <Link to="/products" className="btn bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:-translate-y-1 inline-flex w-max">
                Claim Offer <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-auto overflow-hidden">
            {/* Soft gradient fades to blend image with the solid background color */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-brand-900 z-10 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent z-10 md:hidden" />

            {/* The Image */}
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1000"
              alt="Special Deals Event"
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[10000ms] ease-out origin-center"
            />

            {/* Cool glowing orb effect over the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-500 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Verified Vendors Section */}
      {vendors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">Explore Trusted Shops & Verified Sellers</h2>
            <p className="text-sm sm:text-base text-white/50 mt-3 max-w-2xl mx-auto italic">
              Discover verified vendors, authentic stores & their exclusive products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor._id}
                to={vendor._id.startsWith('mock-')
                  ? `/products?search=${encodeURIComponent(vendor.storeName || vendor.name)}`
                  : `/products?vendorId=${vendor._id}`}
                className="group relative bg-[#131b2f] border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:border-brand-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-[60px] group-hover:bg-brand-500/20 transition-all" />

                <div className="relative flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 border-2 border-white/5 group-hover:border-brand-500/50 transition-all shadow-xl group-hover:scale-110 duration-500">
                    <img
                      src={vendor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.storeName || vendor.name}`}
                      alt={vendor.storeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                    {vendor.storeName || vendor.name}
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-4">
                    <ShieldCheck className="w-3 h-3" /> Verified Seller
                  </div>
                  <p className="text-sm text-white/40 line-clamp-2 min-h-[40px] leading-relaxed group-hover:text-white/60 transition-colors">
                    {vendor.storeDescription || `Exclusive collections from ${vendor.storeName || vendor.name}. Shop premium quality products.`}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/5 w-full">
                    <span className="text-xs font-semibold text-brand-400 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Visit Store <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Deals Products */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-white">🔥 Best Deals</h2>
            <p className="text-sm text-white/50 mt-2">Massive discounts on premium products you can't miss</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {deals.map(p => <ProductCard key={p._id} product={p} isDark={true} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-20">
        <div className="text-center mb-10 relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-accent-500" />
            <h2 className="text-3xl font-display font-bold text-white">Trending Now</h2>
          </div>
          <p className="text-sm text-white/50">Stay ahead of the curve with our latest arrivals</p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
            <Link to="/products" className="text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trending.map(p => <ProductCard key={p._id} product={p} isDark={true} />)}
        </div>
      </section>
    </div>
  );
}
