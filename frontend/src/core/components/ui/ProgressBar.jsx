import { classNames } from '../../utils/helpers';

export default function ProgressBar({ value, max = 100, size = 'md', color = 'teal', showLabel = false, className = '' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    teal: 'bg-gradient-brand',
    pink: 'bg-gradient-accent',
    success: 'bg-state-success',
    warning: 'bg-state-warning',
    danger: 'bg-state-danger',
  };

  return (
    <div className={classNames('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-content-secondary">{value} / {max}</span>
          <span className="text-xs font-medium text-content-primary">{percent.toFixed(0)}%</span>
        </div>
      )}
      <div className={classNames('w-full bg-surface-input rounded-none overflow-hidden', heights[size])}>
        <div
          className={classNames('h-full rounded-none transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
