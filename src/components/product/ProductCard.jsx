import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, isDark = false }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return navigate('/login');
    }
    await addToCart(product._id);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your wishlist');
      return navigate('/login');
    }
    await toggleWishlist(product._id);
    toast.info(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product._id}`} className={`card card-hover group block border ${isDark ? 'bg-[#131b2f] border-white/10' : 'bg-white border-surface-100'}`}>
      <div className={`relative overflow-hidden aspect-square ${isDark ? 'bg-[#0a0f1c]' : 'bg-surface-50'}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-3 right-12 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Low Stock
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform ${isDark ? 'bg-[#131b2f]/90 hover:bg-[#131b2f]' : 'bg-white/90'}`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : (isDark ? 'text-white/60' : 'text-surface-600')}`} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary btn-sm justify-center"
          >
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className={`text-xs mb-1 ${isDark ? 'text-white/60' : 'text-surface-500'}`}>{product.category}</p>
        <h3 className={`font-semibold text-sm line-clamp-2 leading-snug mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5 bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            {product.rating}
          </div>
          <span className={`text-xs ${isDark ? 'text-white/40' : 'text-surface-400'}`}>({product.reviewCount?.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={`text-sm line-through ${isDark ? 'text-white/40' : 'text-surface-400'}`}>₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
