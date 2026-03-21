import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Package, Home, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const { clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const finalizeOrder = async () => {
      if (processed.current) return;
      processed.current = true;

      const pendingOrder = JSON.parse(sessionStorage.getItem('pending_order'));
      
      if (!pendingOrder || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        const orderData = {
          ...pendingOrder,
          paymentMethod: 'Stripe',
          paymentStatus: 'Paid',
          paymentId: sessionId
        };

        const { data } = await api.post('/orders', orderData);
        
        if (data.success) {
          setOrder(data.order);
          clearCart();
          sessionStorage.removeItem('pending_order');
          toast.success('Order placed successfully!');
        }
      } catch (err) {
        console.error('Finalization error:', err);
        toast.error('Failed to save order details. Our team will contact you.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      finalizeOrder();
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart, toast]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-surface-900">Finalizing your order...</h2>
        <p className="text-surface-500">Please do not refresh or close this page.</p>
      </div>
    );
  }

  const orderId = order?._id || 'N/A';
  const total = order?.totalAmount || 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">Payment Successful!</h1>
        <p className="text-surface-500 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
        <div className="card p-5 text-left mb-6 bg-emerald-50/30 border-emerald-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-surface-500">Order ID</p><p className="font-mono text-[11px] font-bold text-surface-900">{orderId}</p></div>
            <div><p className="text-surface-500">Amount Paid</p><p className="font-semibold text-surface-900">₹{total.toLocaleString()}</p></div>
            <div><p className="text-surface-500">Payment Status</p><p className="badge-green">Paid</p></div>
            <div><p className="text-surface-500">Mode</p><p className="font-semibold text-surface-900">Stripe Secure</p></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-primary justify-center"><Package className="w-4 h-4" /> View My Orders</Link>
          <Link to="/" className="btn-secondary justify-center"><Home className="w-4 h-4" /> Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentFailurePage() {
  const { state } = useLocation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">Payment Failed</h1>
        <p className="text-surface-500 mb-6">Something went wrong with your payment. Please try again or use a different payment method.</p>
        <div className="card p-5 text-left mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-surface-500">Order ID</p><p className="font-semibold text-surface-900">{state?.orderId || 'N/A'}</p></div>
            <div><p className="text-surface-500">Amount</p><p className="font-semibold text-surface-900">₹{(state?.total || 0).toLocaleString()}</p></div>
            <div><p className="text-surface-500">Status</p><p className="badge-red">Failed</p></div>
            <div><p className="text-surface-500">Error</p><p className="font-semibold text-red-600">Transaction declined</p></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/checkout" className="btn-primary justify-center"><ArrowRight className="w-4 h-4" /> Retry Payment</Link>
          <Link to="/cart" className="btn-secondary justify-center">Back to Cart</Link>
        </div>
      </div>
    </div>
  );
}
