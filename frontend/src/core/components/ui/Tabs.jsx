import { classNames } from '../../utils/helpers';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={classNames('flex gap-1 bg-white border border-border rounded-2xl p-1.5 shadow-sm', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={classNames(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group',
            activeTab === tab.key
              ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
              : 'text-content-tertiary hover:text-content-primary hover:bg-surface-secondary'
          )}
        >
          {tab.icon && (
            <tab.icon className={classNames(
              'w-4 h-4 flex-shrink-0 transition-transform duration-300',
              activeTab === tab.key ? 'scale-110' : 'opacity-60 group-hover:scale-110 group-hover:opacity-100'
            )} />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {tab.label}
          </span>
          {tab.count !== undefined && (
            <span className={classNames(
              'px-1.5 py-0.5 text-[8px] font-black rounded-lg',
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-surface-secondary text-content-tertiary'
            )}>
              {tab.count}
            </span>
          )}
          
          {/* Subtle click effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity pointer-events-none" />
        </button>
      ))}
    </div>
  );
}
