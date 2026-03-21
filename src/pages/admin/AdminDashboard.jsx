import { useState, useEffect } from 'react';
import { Users, Store, Package, DollarSign, ShoppingCart, UserPlus } from 'lucide-react';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalProducts: 0, totalRevenue: 0, pendingVendors: 0, ordersToday: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [{ data: dashData }, { data: ordersData }] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/orders')
        ]);

        if (dashData.success) {
          setStats(dashData.stats);
          setMonthlyData(dashData.monthlyData);
        }

        if (ordersData.success) {
          const distribution = ordersData.orders.reduce((acc, order) => {
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
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your marketplace performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="brand" />
        <StatCard title="Total Vendors" value={stats.totalVendors} icon={Store} color="accent" />
        <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} color="green" />
        <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="purple" />
        <StatCard title="Total Orders" value={stats.ordersToday} icon={ShoppingCart} color="amber" />
        <StatCard title="Pending Vendors" value={stats.pendingVendors} icon={UserPlus} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
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
    </div>
  );
}
