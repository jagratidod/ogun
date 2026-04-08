import { classNames } from '../../utils/helpers';

export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={classNames('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        <h1 className="text-xl font-bold text-content-primary">{title}</h1>
        {subtitle && <p className="text-sm text-content-secondary mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
