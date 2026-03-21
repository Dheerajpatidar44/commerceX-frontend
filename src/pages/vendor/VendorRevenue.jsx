import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

const CATEGORY_DATA = [
  { name: 'Electronics', value: 45, color: '#3b82f6' },
  { name: 'Fashion', value: 23, color: '#f97316' },
  { name: 'Home & Kitchen', value: 18, color: '#10b981' },
  { name: 'Books', value: 14, color: '#8b5cf6' },
];

export default function VendorRevenue() {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [dashRes, revRes] = await Promise.all([
          api.get('/vendor/dashboard'),
          api.get('/vendor/revenue'),
        ]);
        
        if (dashRes.data.success) {
          setStats(dashRes.data.stats);
        }
        if (revRes.data.success) {
          setRevenueData(revRes.data.monthlyRevenue);
        }
      } catch (err) {
        console.error('Failed to fetch revenue data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

  const currentMonth = revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : 0;
  const avgOrderValue = stats.totalOrders > 0 ? (stats.revenue / stats.totalOrders) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Revenue & Analytics</h1>
        <p className="page-subtitle">Insights into your store's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="This Month" value={`₹${currentMonth.toLocaleString()}`} icon={TrendingUp} color="brand" />
        <StatCard title="Orders" value={stats.totalOrders} icon={ShoppingCart} color="accent" />
        <StatCard title="Avg Order Value" value={`₹${Math.round(avgOrderValue).toLocaleString()}`} icon={Target} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-surface-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {CATEGORY_DATA.map(c => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</div>
                <span className="font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
