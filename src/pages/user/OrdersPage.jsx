import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Eye } from 'lucide-react';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReturn = async (id) => {
    if (!window.confirm('Are you sure you want to request a return for this order?')) return;
    setReturning(true);
    try {
      const { data } = await api.put(`/orders/return/${id}`);
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === id ? data.order : o));
        setSelectedOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to request return', err);
      alert(err.response?.data?.message || 'Failed to request return');
    } finally {
      setReturning(false);
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'Delivered': return 'badge-green';
      case 'Shipped': return 'badge-blue';
      case 'Pending': return 'badge-yellow';
      case 'Processing': return 'badge-orange';
      case 'Return Requested': return 'badge-purple';
      case 'Return Approved': return 'badge-green';
      case 'Return Rejected': return 'badge-red';
      case 'Returned': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState icon={Package} title="No orders yet" description="Once you place an order, it will appear here" actionLabel="Start Shopping" actionTo="/products" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="page-title mb-6">My Orders</h1>

      {!selectedOrder ? (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5 card-hover cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-surface-900">{order._id}</p>
                  <p className="text-xs text-surface-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColor(order.status)}>{order.status}</span>
                  <span className="font-bold text-surface-900">₹{order.totalAmount.toLocaleString()}</span>
                  <Eye className="w-4 h-4 text-surface-400" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5">
                    <img src={item.image || 'https://via.placeholder.com/150'} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="text-xs text-surface-700 font-medium truncate max-w-[150px]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Order Detail */
        <div className="animate-fade-in">
          <button onClick={() => setSelectedOrder(null)} className="btn-ghost btn-sm mb-4">← Back to Orders</button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg">{selectedOrder._id}</h2>
                  <span className={statusColor(selectedOrder.status)}>{selectedOrder.status}</span>
                </div>
                {/* Tracking Steps */}
                <div className="relative">
                  <div className="flex justify-between">
                    {selectedOrder.trackingSteps.map((step, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-surface-200 text-surface-500'}`}>
                          {step.done ? '✓' : i + 1}
                        </div>
                        <p className={`text-xs mt-2 text-center ${step.done ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>{step.label}</p>
                        {step.date && <p className="text-[10px] text-surface-400">{new Date(step.date).toLocaleDateString()}</p>}
                        {i < selectedOrder.trackingSteps.length - 1 && (
                          <div className={`absolute top-4 h-0.5 ${step.done && selectedOrder.trackingSteps[i + 1]?.done ? 'bg-emerald-400' : 'bg-surface-200'}`}
                            style={{ left: `${(100 / selectedOrder.trackingSteps.length) * i + (50 / selectedOrder.trackingSteps.length)}%`, width: `${100 / selectedOrder.trackingSteps.length}%` }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-surface-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <img src={item.image || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1"><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-surface-500">Qty: {item.quantity}</p></div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-semibold text-surface-900 mb-3 text-sm">Shipping Address</h3>
                <div className="text-sm text-surface-600 space-y-0.5">
                  <p className="font-medium text-surface-900">{selectedOrder.address.name}</p>
                  <p>{selectedOrder.address.address}</p>
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                  <p>Phone: {selectedOrder.address.phone}</p>
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-surface-900 mb-3 text-sm">Payment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-surface-500">Method</span><span className="font-medium capitalize">{selectedOrder.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Status</span><span className={selectedOrder.paymentStatus === 'Paid' ? 'badge-green' : 'badge-red'}>{selectedOrder.paymentStatus}</span></div>
                  {selectedOrder.paymentId && <div className="flex justify-between"><span className="text-surface-500">ID</span><span className="font-mono text-xs text-surface-400">{selectedOrder.paymentId}</span></div>}
                  <hr className="border-surface-100" />
                  <div className="flex justify-between font-bold text-lg text-surface-900 pt-1"><span>Total</span><span>₹{selectedOrder.totalAmount.toLocaleString()}</span></div>
                </div>
              </div>

              {selectedOrder.status === 'Delivered' && (
                <button 
                  onClick={() => handleReturn(selectedOrder._id)} 
                  disabled={returning}
                  className="btn-danger w-full justify-center py-3"
                >
                  {returning ? 'Processing...' : 'Return Order'}
                </button>
              )}

              {selectedOrder.status === 'Return Requested' && (
                <div className="card p-4 bg-purple-50 border-purple-100 text-purple-700 text-sm text-center font-medium">
                  Return has been requested and is under review by the vendor.
                </div>
              )}

              {selectedOrder.status === 'Return Approved' && (
                <div className="card p-4 bg-emerald-50 border-emerald-100 text-emerald-700 text-sm text-center font-medium">
                  Your return request has been approved. Our team will contact you for pickup.
                </div>
              )}

              {selectedOrder.status === 'Return Rejected' && (
                <div className="card p-4 bg-red-50 border-red-100 text-red-700 text-sm text-center font-medium">
                  Your return request was rejected by the vendor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
