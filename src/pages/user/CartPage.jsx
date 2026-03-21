import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const { enrichedCart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const toast = useToast();

  if (enrichedCart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add some products to your cart and they'll show up here" actionLabel="Start Shopping" actionTo="/products" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="page-title mb-6">Shopping Cart ({enrichedCart.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {enrichedCart.map(({ productId, quantity, product }) => (
            <div key={productId} className="card p-4 flex gap-4">
              <Link to={`/product/${productId}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-50 flex-shrink-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${productId}`} className="font-semibold text-sm text-surface-900 hover:text-brand-600 line-clamp-2">{product.name}</Link>
                  <p className="text-xs text-surface-500 mt-0.5">by {product.vendorName}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-0">
                    <button onClick={() => updateQuantity(productId, quantity - 1)} disabled={quantity <= 1} className="p-1.5 rounded-lg hover:bg-surface-100 disabled:opacity-40">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(productId, quantity + 1)} className="p-1.5 rounded-lg hover:bg-surface-100">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-surface-900">₹{(product.price * quantity).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => { removeFromCart(productId); toast.info('Removed from cart'); }} className="self-start p-2 rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="card p-6 sticky top-20">
            <h3 className="font-display font-semibold text-lg text-surface-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="font-medium">₹{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Delivery</span><span className="font-medium text-emerald-600">{cartTotal > 499 ? 'Free' : '₹49'}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Tax (GST 18%)</span><span className="font-medium">₹{Math.round(cartTotal * 0.18).toLocaleString()}</span></div>
              <hr className="border-surface-100" />
              <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold text-surface-900">₹{(cartTotal + Math.round(cartTotal * 0.18) + (cartTotal > 499 ? 0 : 49)).toLocaleString()}</span></div>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center btn-lg mt-6">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="btn-ghost w-full justify-center btn-sm mt-2">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
