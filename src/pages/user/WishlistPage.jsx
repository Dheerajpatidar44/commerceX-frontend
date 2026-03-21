import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        setWishlistProducts(data.products);
      } catch (err) {
        console.error('Failed to fetch wishlist products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [wishlist.length]); // Re-fetch when wishlist length changes

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save products you love and they'll appear here" actionLabel="Discover Products" actionTo="/products" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="page-title mb-6">My Wishlist ({wishlistProducts.length} items)</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {wishlistProducts.map(product => (
          <div key={product._id} className="card card-hover group block h-full flex flex-col">
            <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-surface-50">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-xs text-surface-500 mb-1">{product.category}</p>
              <h3 className="font-semibold text-sm text-surface-900 line-clamp-2 mb-2">{product.name}</h3>
              <div className="mt-auto">
                <p className="text-lg font-bold text-surface-900 mb-3">₹{product.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => { addToCart(product._id); removeFromWishlist(product._id); toast.success('Moved to cart!'); }}
                    className="btn-primary btn-sm flex-1 justify-center">
                    <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                  <button onClick={() => { removeFromWishlist(product._id); toast.info('Removed'); }}
                    className="btn-ghost btn-sm text-red-500 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
