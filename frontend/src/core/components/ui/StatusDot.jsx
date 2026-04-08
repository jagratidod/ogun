import { classNames } from '../../utils/helpers';

export default function StatusDot({ status = 'default', pulse = false, className = '' }) {
  const colors = {
    active: 'bg-state-success',
    success: 'bg-state-success',
    online: 'bg-state-success',
    warning: 'bg-state-warning',
    pending: 'bg-state-warning',
    danger: 'bg-state-danger',
    error: 'bg-state-danger',
    offline: 'bg-state-danger',
    info: 'bg-state-info',
    default: 'bg-content-tertiary',
  };

  return (
    <span className={classNames('relative inline-flex h-2.5 w-2.5', className)}>
      {pulse && (
        <span className={classNames(
          'absolute inline-flex h-full w-full rounded-none opacity-75 animate-ping',
          colors[status] || colors.default
        )} />
      )}
      <span className={classNames(
        'relative inline-flex rounded-none h-2.5 w-2.5',
        colors[status] || colors.default
      )} />
    </span>
  );
}
