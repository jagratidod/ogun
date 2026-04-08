import { classNames } from '../../utils/helpers';

export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={classNames(
        hover ? 'glass-card-hover' : 'glass-card',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', action }) {
  return (
    <div className={classNames('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={classNames('text-base font-semibold text-content-primary', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={classNames('text-sm text-content-secondary mt-0.5', className)}>
      {children}
    </p>
  );
}
