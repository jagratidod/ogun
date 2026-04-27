import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine, RiUserAddLine, RiShoppingCartLine,
  RiBarChartLine, RiCompass3Fill, RiUserLine, RiArrowLeftSLine, RiNotification3Fill, RiCustomerServiceLine
} from 'react-icons/ri';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { APP_NAME } from '../../utils/constants';

const bottomNavItems = [
  { label: 'Home', icon: RiDashboardLine, path: '/sales', exact: true },
  { label: 'Explore', icon: RiCompass3Fill, path: '/sales/social' },
  { label: 'Retailers', icon: RiUserAddLine, path: '/sales/retailers' },
  { label: 'Terminal', icon: RiShoppingCartLine, path: '/sales/terminal' },
  { label: 'Service', icon: RiCustomerServiceLine, path: '/sales/service' },
  { label: 'Profile', icon: RiUserLine, path: '/sales/profile' },
];

export default function SalesLayout() {
  const { user } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isBasePage = location.pathname === '/sales';

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-surface-primary">
        {/* Styled Header like Customer App */}
        <header className="sticky top-0 z-30 bg-gradient-to-b from-brand-teal/30 via-brand-teal/10 to-surface-primary backdrop-blur-xl border-b border-border/40 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isBasePage && (
                <button
                  onClick={() => navigate(-1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-content-primary transition-all active:scale-90"
                  title="Go Back"
                >
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>
              )}
              {isBasePage && (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-teal/10 border border-brand-teal/20">
                  <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-content-primary tracking-tight leading-none uppercase tracking-widest">
                  {isBasePage ? APP_NAME : location.pathname.split('/').pop().toUpperCase()}
                </span>
                <span className="text-[7px] text-brand-teal font-black uppercase tracking-[0.3em] mt-1 opacity-70">
                  {isBasePage ? 'Field Operations' : 'Sales Executive'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden xs:flex flex-col text-right mr-2">
                <p className="text-[10px] font-black text-content-primary leading-none">{user?.name}</p>
                <p className="text-[7px] text-brand-teal font-bold uppercase tracking-widest mt-1 opacity-70">
                  {user?.salesExecutiveData?.assignedArea || 'Field Force'}
                </p>
              </div>
              <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-content-tertiary transition-all">
                <RiNotification3Fill className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-pink rounded-full border border-white" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        <BottomNav items={bottomNavItems} />
      </div>
    </SidebarProvider>
  );
}
