import { PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon = PackageX, title = 'Nothing here', description = 'No items found.', actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-surface-400" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-lg text-surface-900">{title}</h3>
        <p className="text-sm text-surface-500 mt-1">{description}</p>
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary btn-sm mt-2">{actionLabel}</Link>
      )}
    </div>
  );
}
