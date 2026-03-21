export default function StatCard({ title, value, icon: Icon, color = 'brand', change, subtitle }) {
  const colorMap = {
    brand: 'bg-brand-100 text-brand-600',
    accent: 'bg-accent-100 text-accent-600',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="stat-card card-hover">
      <div className={`stat-icon ${colorMap[color]}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-0.5">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
        {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
