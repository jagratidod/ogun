import { RiInboxLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export default function EmptyState({ icon: Icon = RiInboxLine, title = 'No data found', description = '', action, className = '' }) {
  return (
    <div className={classNames('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-16 h-16 rounded-none bg-surface-input flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-content-tertiary" />
      </div>
      <h3 className="text-base font-medium text-content-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-content-secondary text-center max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
