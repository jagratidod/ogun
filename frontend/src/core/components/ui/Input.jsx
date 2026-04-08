import { classNames } from '../../utils/helpers';

export default function Input({ label, error, icon: Icon, className = '', id, ...props }) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-content-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
        )}
        <input
          id={inputId}
          className={classNames(
            'input-field w-full',
            Icon && 'pl-10',
            error && 'border-state-danger focus:border-state-danger focus:ring-state-danger/30'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-state-danger">{error}</p>}
    </div>
  );
}
