import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, ChevronRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const toast = useToast();

  const isAdminOrVendor = currentUser && (currentUser.role === 'admin' || currentUser.role === 'vendor');

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setProduct(pRes.data.product);
        setReviews(rRes.data.reviews);
      } catch (err) {
        console.error('Product fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16"><EmptyState title="Product not found" description="This product doesn't exist." actionLabel="Browse Products" actionTo="/products" /></div>;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return navigate('/login');
    }
    await addToCart(product._id, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to leave a review');
    if (!newReview.comment) return;

    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', {
        productId: product._id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setReviews(prev => [data.review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      {!isAdminOrVendor && (
        <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-brand-600">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/products?category=${product.category}`} className="hover:text-brand-600">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-surface-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-50 mb-3">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${i === selectedImage ? 'border-brand-500 ring-2 ring-brand-200' : 'border-surface-200 hover:border-surface-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="badge-blue mb-3">{product.category}</span>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-surface-900 mb-3">{product.name}</h1>
          <p className="text-sm text-surface-500 mb-2">by <span className="text-brand-600 font-medium">{product.vendorName}</span></p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-sm font-semibold">
              <Star className="w-4 h-4 fill-current" /> {product.rating}
            </div>
            <span className="text-sm text-surface-500">{product.reviewCount?.toLocaleString()} ratings</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-surface-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-surface-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="badge-green">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-sm text-surface-600 leading-relaxed mb-6">{product.description}</p>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-6 ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
            {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚠ Only ${product.stock} left` : '✗ Out of Stock'}
          </div>

          {/* Quantity + Actions - Hidden for Admin & Vendor */}
          {(!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'vendor')) && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border border-surface-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-surface-50 transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="px-4 text-sm font-semibold min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-surface-50 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary btn-lg flex-1 sm:flex-initial justify-center">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button onClick={async () => {
                if (!isAuthenticated) {
                  toast.info('Please log in to save items to your wishlist');
                  return navigate('/login');
                }
                await toggleWishlist(product._id);
                toast.info(isInWishlist(product._id) ? 'Removed' : 'Added to wishlist');
              }}
                className={`btn btn-lg border ${isInWishlist(product._id) ? 'border-red-200 bg-red-50 text-red-600' : 'border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: RotateCcw, label: '30-Day Return' },
              { icon: ShieldCheck, label: 'Warranty' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-50 text-center">
                <Icon className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-medium text-surface-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12 lg:mt-16">
        <h2 className="text-xl font-display font-bold text-surface-900 mb-6">Ratings & Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="card p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="input-label">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setNewReview(p => ({ ...p, rating: star }))}>
                      <Star className={`w-6 h-6 transition-colors ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Comment</label>
                <textarea className="input-field min-h-[100px] resize-none" placeholder="Share your experience..." value={newReview.comment}
                  onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full justify-center">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-surface-500 py-8 text-center">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(r => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <img src={r.avatar || 'https://i.pravatar.cc/40?img=99'} alt="" className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-surface-900">{r.userName}</span>
                        <span className="text-xs text-surface-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`} />)}
                      </div>
                      <p className="text-sm text-surface-600">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
