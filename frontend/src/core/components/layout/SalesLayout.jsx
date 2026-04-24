import { Outlet, NavLink } from 'react-router-dom';
import { 
  RiDashboardLine, RiUserAddLine, RiShoppingCartLine, 
  RiBarChartLine, RiTrophyLine, RiUserLine, RiMenuLine 
} from 'react-icons/ri';
import { classNames } from '../../utils/helpers';
import { APP_NAME } from '../../utils/constants';
import { useAuthContext } from '../../context/AuthContext';

export default function SalesLayout() {
  const { user } = useAuthContext();

  const navItems = [
    { label: 'Home', icon: RiDashboardLine, path: '/sales' },
    { label: 'Retailers', icon: RiUserAddLine, path: '/sales/retailers' },
    { label: 'Sell', icon: RiShoppingCartLine, path: '/sales/terminal' },
    { label: 'Metrics', icon: RiBarChartLine, path: '/sales/performance' },
    { label: 'Rewards', icon: RiTrophyLine, path: '/sales/rewards' },
    { label: 'Me', icon: RiUserLine, path: '/sales/profile' }
  ];

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-primary border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm tracking-tight text-content-primary">{APP_NAME} <span className="text-brand-teal text-[10px] uppercase ml-1">Exec</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black text-content-primary leading-none">{user?.name}</p>
            <p className="text-[8px] text-brand-teal font-bold uppercase mt-0.5 tracking-widest">{user?.salesExecutiveData?.assignedArea || 'Field Force'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
            <span className="text-xs font-black text-brand-teal">{user?.name?.charAt(0)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-primary border-t border-border px-2 h-16 flex items-center justify-between shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/sales'}
            className={({ isActive }) => classNames(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300",
              isActive ? "text-brand-teal" : "text-content-tertiary"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={classNames("w-5 h-5", isActive && "scale-110")} />
                <span className={classNames("text-[9px] font-bold uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-60")}>
                  {item.label}
                </span>
                {isActive && <div className="absolute top-0 w-8 h-1 bg-brand-teal rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
