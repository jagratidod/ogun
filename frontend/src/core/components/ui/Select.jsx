import { classNames } from '../../utils/helpers';

export default function Select({ label, options = [], error, className = '', id, ...props }) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-content-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={classNames(
          'input-field w-full appearance-none cursor-pointer',
          error && 'border-state-danger'
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-state-danger">{error}</p>}
    </div>
  );
}
