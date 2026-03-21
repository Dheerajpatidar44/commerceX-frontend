import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function AdminRevenue() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, activeUsers: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [revRes, dashRes] = await Promise.all([
          api.get('/admin/revenue'),
          api.get('/admin/dashboard'),
        ]);
        
        if (revRes.data.success) {
          setRevenueData(revRes.data.monthlyData);
          setStats(s => ({ ...s, totalRevenue: revRes.data.totalRevenue }));
        }
        if (dashRes.data.success) {
          setStats(s => ({ ...s, totalOrders: dashRes.data.stats.ordersToday, activeUsers: dashRes.data.stats.totalUsers }));
        }
      } catch (err) {
        console.error('Failed to fetch admin revenue data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

  const currentMonth = revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Revenue Overview</h1>
        <p className="page-subtitle">Track marketplace revenue and growth</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="This Month" value={`₹${currentMonth.toLocaleString()}`} icon={TrendingUp} color="brand" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="accent" />
        <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#adminRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
