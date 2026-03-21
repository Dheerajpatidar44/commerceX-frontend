import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

const STATUS_COLORS = {
  'Pending': '#fbbf24',
  'Processing': '#f97316',
  'Shipped': '#3b82f6',
  'Out for Delivery': '#8b5cf6',
  'Delivered': '#10b981',
  'Return Requested': '#ef4444',
  'Return Approved': '#ec4899',
  'Return Rejected': '#6b7280'
};

export default function VendorDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, pendingOrders: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, revRes, ordRes] = await Promise.all([
          api.get('/vendor/dashboard'),
          api.get('/vendor/revenue'),
          api.get('/vendor/orders')
        ]);
        
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (revRes.data.success) setRevenueData(revRes.data.monthlyRevenue);
        
        if (ordRes.data.success) {
          const orders = ordRes.data.orders;
          setRecentOrders(orders.slice(0, 5));
          
          // Calculate status distribution
          const distribution = orders.reduce((acc, order) => {
            const status = order.status || 'Pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          
          const pieData = Object.keys(distribution).map(status => ({
            name: status,
            value: distribution[status]
          }));
          setStatusData(pieData);
        }
      } catch (err) {
        console.error('Failed to fetch vendor dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back! Here's your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="brand" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="green" />
        <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="accent" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h3 className="font-display font-semibold text-surface-900">Recent Orders</h3>
          <span className="text-xs text-surface-500">{recentOrders.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o._id}>
                  <td className="font-medium font-mono text-xs">{o._id}</td>
                  <td>{o.address?.name || 'Unknown'}</td>
                  <td className="font-semibold">₹{o.totalAmount.toLocaleString()}</td>
                  <td><span className={o.status === 'Delivered' ? 'badge-green' : o.status === 'Shipped' ? 'badge-blue' : o.status === 'Processing' ? 'badge-orange' : 'badge-yellow'}>{o.status}</span></td>
                  <td className="text-xs text-surface-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-surface-500">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
