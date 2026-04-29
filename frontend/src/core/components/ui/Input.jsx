import { classNames } from '../../utils/helpers';

export default function Input({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  id, 
  ...props 
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;
  
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1 opacity-70"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={classNames(
            'w-full h-11 bg-surface-input border border-border rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-teal/40 transition-all shadow-sm placeholder:text-content-tertiary/50 text-content-primary',
            Icon ? 'pl-11' : 'pl-4',
            'pr-4',
            error ? 'border-state-danger' : 'hover:border-brand-teal/20'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-state-danger mt-1 px-1">{error}</p>}
    </div>
  );
}
