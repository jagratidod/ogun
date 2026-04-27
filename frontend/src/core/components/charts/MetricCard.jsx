import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';
import { formatCurrency, shortenNumber } from '../../utils/formatters';

export default function MetricCard({ title, value, change, changeLabel = 'vs last month', icon: Icon, format = 'number', className = '' }) {
  const isPositive = change >= 0;
  const formattedValue = format === 'currency' ? formatCurrency(value) : format === 'short' ? shortenNumber(value) : value;

  return (
    <div className={classNames(
      'relative overflow-hidden p-5 transition-all duration-300',
      'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
      'hover:shadow-2xl hover:shadow-brand-teal/10 hover:-translate-y-1',
      'group',
      className
    )}>
      {/* Decorative Background Icon */}
      {Icon && (
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
          <Icon className="w-24 h-24 rotate-12" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary">{title}</p>
             <h3 className="text-2xl font-black text-content-primary tracking-tight">{formattedValue}</h3>
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-none bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 shadow-sm">
              <Icon className="w-5 h-5 text-brand-teal group-hover:text-white transition-colors" />
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={classNames(
              'flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-black rounded-none border',
              isPositive 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border-rose-100'
            )}>
              {isPositive ? <RiArrowUpLine className="w-3 h-3" /> : <RiArrowDownLine className="w-3 h-3" />}
              {Math.abs(change).toFixed(1)}%
            </div>
            <span className="text-[9px] font-bold text-content-tertiary uppercase tracking-widest">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

