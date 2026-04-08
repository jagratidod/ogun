import { classNames } from '../../utils/helpers';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={classNames('flex gap-1 bg-surface-input rounded-none p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={classNames(
            'flex-1 px-4 py-2 text-sm font-medium rounded-none transition-all duration-200',
            activeTab === tab.key
              ? 'bg-brand-teal/15 text-brand-teal shadow-sm'
              : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover'
          )}
        >
          {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline" />}
          {tab.label}
          {tab.count !== undefined && (
            <span className={classNames(
              'ml-2 px-1.5 py-0.5 text-xs rounded-none',
              activeTab === tab.key ? 'bg-brand-teal/20' : 'bg-surface-hover'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
