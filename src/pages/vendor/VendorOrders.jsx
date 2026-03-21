import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function VendorOrders() {
  const toast = useToast();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/vendor/orders');
        if (data.success) {
          setOrderList(data.orders);
        }
      } catch (err) {
        toast.error('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/vendor/orders/${id}/status`, { status: newStatus });
      if (data.success) {
        setOrderList(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        toast.success(`Order ${id} updated to ${newStatus}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
      console.error(err);
    }
  };

  const handleReturnAction = async (id, action) => {
    try {
      const { data } = await api.put(`/vendor/orders/${id}/return`, { action });
      if (data.success) {
        setOrderList(prev => prev.map(o => o._id === id ? data.order : o));
        toast.success(`Return ${action}ed for order ${id}`);
      }
    } catch (err) {
      toast.error('Failed to process return');
      console.error(err);
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

  const statuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Order Management</h1>
        <p className="page-subtitle">Manage and track your customer orders</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product(s)</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orderList.map(o => (
                <tr key={o._id}>
                  <td className="font-mono text-xs font-medium">{o._id}</td>
                  <td>{o.address?.name || 'Unknown'}</td>
                  <td className="truncate max-w-[180px]">
                    {o.items.map(i => i.name).join(', ')}
                  </td>
                  <td className="font-semibold">₹{o.totalAmount.toLocaleString()}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{o.paymentMethod || 'Stripe'}</span>
                      <span className={o.paymentStatus === 'Paid' ? 'badge-green' : 'badge-yellow'}>{o.paymentStatus}</span>
                    </div>
                  </td>
                  <td>
                    {o.status === 'Return Requested' ? (
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <span className={statusColor(o.status)}>{o.status}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleReturnAction(o._id, 'approve')} className="btn-primary py-1 px-2 text-[10px] flex-1 justify-center">Approve</button>
                          <button onClick={() => handleReturnAction(o._id, 'reject')} className="btn-danger py-1 px-2 text-[10px] flex-1 justify-center">Reject</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className={`${statusColor(o.status)} mb-1 w-fit`}>{o.status}</span>
                        {!['Return Approved', 'Return Rejected', 'Returned'].includes(o.status) && (
                          <select value={o.status} onChange={e => handleStatusUpdate(o._id, e.target.value)}
                            className="input-field py-1 px-2 text-xs min-w-[120px]">
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="text-xs text-surface-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr><td colSpan="7" className="text-center py-4 text-surface-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
