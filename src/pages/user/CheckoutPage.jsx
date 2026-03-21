import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Loader2, Info, ShieldCheck, RotateCcw, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

export default function CheckoutPage() {
  const { enrichedCart, cartTotal, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    city: '', 
    state: '', 
    pincode: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const gst = Math.round(cartTotal * 0.18);
  const delivery = cartTotal > 499 ? 0 : 49;
  const totalAmount = cartTotal + gst + delivery;

  const update = (field, val) => setAddress(p => ({ ...p, [field]: val }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const { name, phone, address: addr, city, state, pincode } = address;
    if (!name || !phone || !addr || !city || !state || !pincode) { 
      toast.error('Please fill all address fields'); 
      return; 
    }
    if (enrichedCart.length === 0) { 
      toast.error('Your cart is empty'); 
      return; 
    }

    try {
      setLoading(true);
      
      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/payments/create-checkout-session', {
          items: enrichedCart,
          totalAmount,
          address
        });
        
        if (data.success && data.url) {
          sessionStorage.setItem('pending_order', JSON.stringify({
            items: enrichedCart.map(item => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images?.[0],
              vendorId: item.product.vendorId
            })),
            address,
            totalAmount
          }));
          window.location.href = data.url;
        } else {
          toast.error('Failed to initiate Stripe payment');
        }
        return;
      }

      // COD Logic
      const orderItems = enrichedCart.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0],
        vendorId: item.product.vendorId
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        address,
        paymentMethod: 'COD',
        totalAmount,
        paymentStatus: 'Pending',
        paymentId: `cod_${Date.now()}`
      });

      if (data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${data.order._id}`);
      }
    } catch (err) {
      console.error('Checkout failed', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title mb-1">Checkout</h1>
          <p className="text-surface-500 text-sm">Complete your purchase securely</p>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-surface-400">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center">1</span>
            SHIPPING
          </div>
          <div className="w-8 h-[2px] bg-surface-800" />
          <div className="flex items-center gap-2 text-xs font-bold text-surface-200">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center">2</span>
            PAYMENT
          </div>
        </div>
      </div>
      
      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6 text-white">
            {/* Shipping Address */}
            <div className="card p-8 border-2 border-transparent focus-within:border-brand-500/20 transition-all duration-500 bg-surface-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">Shipping Address</h2>
                  <p className="text-xs text-surface-400">Where should we deliver your order?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">Full Name</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="John Doe" value={address.name} onChange={e => update('name', e.target.value)} required /></div>
                <div className="group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">Phone Number</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="+91 98765 43210" value={address.phone} onChange={e => update('phone', e.target.value)} required /></div>
                <div className="sm:col-span-2 group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">Street Address</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="42, MG Road, Bandra" value={address.address} onChange={e => update('address', e.target.value)} required /></div>
                <div className="group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">City</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="Mumbai" value={address.city} onChange={e => update('city', e.target.value)} required /></div>
                <div className="group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">State</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="Maharashtra" value={address.state} onChange={e => update('state', e.target.value)} required /></div>
                <div className="group"><label className="input-label group-focus-within:text-brand-400 transition-colors uppercase tracking-widest text-[10px] text-surface-400">Pincode</label><input className="input-field bg-surface-950 border-surface-800 text-white focus:border-brand-500" placeholder="400050" value={address.pincode} onChange={e => update('pincode', e.target.value)} required /></div>
              </div>
            </div>

            {/* Trust Badges - DARK THEME */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, title: 'Secure Payment', desc: 'SSL Encrypted', color: 'text-brand-400' },
                { icon: RotateCcw, title: '7 Days Return', desc: 'Easy replacements', color: 'text-emerald-400' },
                { icon: Zap, title: 'Super Fast', desc: 'Quick processing', color: 'text-amber-400' },
              ].map((b, i) => (
                <div key={i} className="card p-4 flex items-center gap-3 bg-surface-900 border-dashed border-surface-800 hover:border-surface-700 transition-colors">
                  <b.icon className={`w-8 h-8 ${b.color} opacity-80`} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.title}</h4>
                    <p className="text-[10px] text-surface-400">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Order Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-20 bg-surface-900 border-surface-800 shadow-none border transition-all duration-500">
              <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
                Order Summary
                <span className="text-[10px] bg-surface-800 text-surface-300 px-2 py-0.5 rounded-full ml-auto">{enrichedCart.length} Items</span>
              </h3>
              
              <div className="space-y-4 mb-4 max-h-[25vh] overflow-y-auto pr-2 custom-scrollbar">
                {enrichedCart.map(({ productId, quantity, product }) => (
                  <div key={productId} className="flex items-center gap-3 group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-surface-800 group-hover:border-brand-500/50 transition-colors bg-surface-950">
                      <img src={product.images?.[0]} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.name}</p>
                      <p className="text-[11px] text-surface-400 font-medium">Qty: {quantity} • ₹{product.price.toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-bold text-white">₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Payment Method - DARK THEME */}
              <div className="pt-6 border-t border-surface-800 mb-6">
                <label className="text-[11px] font-bold text-surface-500 uppercase tracking-widest mb-4 block">Payment Method</label>
                <div className="space-y-2">
                  {[
                    { id: 'stripe', label: 'Stripe', desc: 'Secure Checkout', icon: '🌍' },
                    { id: 'cod', label: 'Cash', desc: 'On Delivery', icon: '💵' },
                  ].map(pm => (
                    <label 
                      key={pm.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                        ${paymentMethod === pm.id 
                          ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                          : 'border-surface-800 bg-surface-950 hover:border-surface-700'}`}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="w-3.5 h-3.5 text-brand-500 focus:ring-brand-500 bg-surface-900 border-surface-700" />
                      <span className={`text-sm rounded-lg w-8 h-8 flex items-center justify-center transition-colors ${paymentMethod === pm.id ? 'bg-brand-500 text-white' : 'bg-surface-800 text-surface-400'}`}>{pm.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${paymentMethod === pm.id ? 'text-white' : 'text-surface-400'}`}>{pm.label}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Totals - DARK THEME */}
              <div className="space-y-3 pt-6 border-t border-surface-800 mb-8">
                <div className="flex justify-between text-xs text-surface-400 font-medium"><span>Subtotal</span><span className="text-surface-200">₹{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-surface-400 font-medium"><span>Tax (GST 18%)</span><span className="text-surface-200">₹{gst.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-surface-400 font-medium"><span>Delivery Charge</span><span>{delivery === 0 ? <span className="text-emerald-400 font-bold tracking-tight">FREE</span> : <span className="text-surface-200">₹{delivery}</span>}</span></div>
                <div className="pt-4 flex justify-between items-end">
                  <span className="text-surface-400 font-black text-[10px] tracking-[0.2em]">TOTAL AMOUNT</span>
                  <span className="font-bold font-display text-3xl text-brand-400 tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || enrichedCart.length === 0}
                className="btn-primary w-full py-4.5 flex items-center justify-center gap-3 text-lg group shadow-xl shadow-brand-900/40 active:scale-[0.98] transition-all bg-brand-600 hover:bg-brand-500 text-white"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {paymentMethod === 'stripe' ? 'Proceed to Secure Payment' : 'Confirm Order'}
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 border-t border-surface-800 pt-5">
                <div className="flex items-center gap-1.5 grayscale opacity-50 group hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">PCI Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
