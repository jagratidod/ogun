import { classNames } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';

export default function Badge({ children, variant = 'default', status, className = '' }) {
  if (status) {
    const colorClass = STATUS_COLORS[status] || 'badge-info';
    return (
      <span className={classNames(colorClass, className)}>
        {children || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </span>
    );
  }

  const variants = {
    default: 'badge bg-surface-hover text-content-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    teal: 'badge-teal',
    pink: 'badge bg-brand-pink/15 text-brand-pink',
    purple: 'badge bg-brand-purple/15 text-brand-purple',
  };

  return (
    <span className={classNames(variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
