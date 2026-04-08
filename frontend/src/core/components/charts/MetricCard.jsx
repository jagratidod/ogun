import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';
import { formatCurrency, shortenNumber } from '../../utils/formatters';

export default function MetricCard({ title, value, change, changeLabel = 'vs last month', icon: Icon, format = 'number', className = '' }) {
  const isPositive = change >= 0;
  const formattedValue = format === 'currency' ? formatCurrency(value) : format === 'short' ? shortenNumber(value) : value;

  return (
    <div className={classNames('metric-card group', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-content-secondary font-medium">{title}</p>
        {Icon && (
          <div className="w-10 h-10 rounded-none bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
            <Icon className="w-5 h-5 text-brand-teal" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-content-primary mt-1">{formattedValue}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={classNames(
            'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded',
            isPositive ? 'bg-state-success/15 text-state-success' : 'bg-state-danger/15 text-state-danger'
          )}>
            {isPositive ? <RiArrowUpLine className="w-3 h-3" /> : <RiArrowDownLine className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-content-tertiary">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
