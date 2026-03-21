import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function AdminOrders() {
  const toast = useToast();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/admin/orders');
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

  const statusColor = (s) => {
    switch (s) {
      case 'Delivered': return 'text-[#10b981]'; // Emerald
      case 'Shipped': return 'text-[#3b82f6]'; // Blue
      case 'Confirmed': return 'text-[#3b82f6]'; // Blue (as seen in image)
      case 'Pending': return 'text-[#f59e0b]'; // Amber
      case 'Processing': return 'text-[#f97316]'; // Orange
      case 'Out for Delivery': return 'text-[#60a5fa]'; // Light Blue
      case 'Cancelled': return 'text-[#ef4444]'; // Red
      case 'Return Requested': return 'text-[#a855f7]'; // Purple
      case 'Return Approved': return 'text-[#10b981]';
      case 'Return Rejected': return 'text-[#ef4444]';
      case 'Returned': return 'text-[#ef4444]';
      default: return 'text-surface-400';
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in bg-[#0a0c10] min-h-screen p-4">
      <div className="page-header px-4 mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Management</h1>
        <p className="text-surface-500 text-sm mt-1">Full marketplace transaction control</p>
      </div>

      <div className="rounded-xl overflow-hidden bg-[#11141b] border border-surface-800/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-800/50 bg-[#151921]">
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/30">
              {orderList.map(o => (
                <tr key={o._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6 align-top">
                    <span className="text-[11px] font-medium text-surface-400">
                      #{o._id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-white leading-none">{o.userId?.name || o.address?.name || 'Customer'}</p>
                      <p className="text-[11px] text-surface-500 font-medium tracking-tight">{o.userId?.phone || o.address?.phone || '1234567890'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-white leading-none">{o.vendor?.name || 'Store House'}</p>
                      <p className="text-[11px] text-surface-500 font-medium truncate max-w-[140px] tracking-tight">{o.vendor?.email || 'vendor@gmail.com'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top min-w-[300px]">
                    <div className="space-y-2">
                      {o.items.map((it, i) => (
                        <p key={i} className="text-[12px] text-surface-200 leading-snug font-medium">
                          {it.name} <span className="text-surface-500 font-bold ml-1">× {it.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <span className="text-[14px] font-bold text-[#10b981] tracking-tight">₹{o.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{(o.paymentMethod || 'Stripe').toUpperCase()}</span>
                      <span className={`text-[10px] font-bold ${o.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'} leading-none`}>
                        {o.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <span className={`text-[12px] font-bold tracking-tight ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 align-top text-right">
                    <p className="text-[12px] font-semibold text-white tracking-tight">
                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-32">
                    <p className="text-sm font-bold text-surface-600 uppercase tracking-widest">No order records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
