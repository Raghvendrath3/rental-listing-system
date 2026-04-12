interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  colorClass = 'blue',
}: StatsCardProps) {
  return (
    <div className="p-6 rounded border border-gray-300 bg-white hover:border-gray-400 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase text-ink-500 font-medium tracking-wide">{label}</p>
          <p className="text-3xl font-medium text-ink-900 mt-3">{value}</p>
        </div>
        {icon && (
          <div className="text-4xl opacity-40 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="font-medium text-ink-900">
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-ink-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
