import { NavLink, useLocation } from 'react-router-dom';
import { classNames } from '../../utils/helpers';

export default function BottomNav({ items }) {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={classNames(
                'bottom-nav-item min-w-[64px]',
                isActive && 'bottom-nav-item-active'
              )}
            >
              <item.icon className={classNames('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && <div className="absolute -top-0.5 w-8 h-0.5 bg-brand-teal rounded-none" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
