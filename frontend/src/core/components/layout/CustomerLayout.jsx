import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  RiNotification3Line, RiArrowLeftLine, RiHome4Line, 
  RiSmartphoneLine, RiCustomerServiceLine, RiUserLine, RiInstagramLine 
} from 'react-icons/ri';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { APP_NAME } from '../../utils/constants';

const bottomNavItems = [
  { label: 'Home', icon: RiHome4Line, path: '/customer', exact: true },
  { label: 'Explore', icon: RiInstagramLine, path: '/customer/social' },
  { label: 'Products', icon: RiSmartphoneLine, path: '/customer/products' },
  { label: 'Service', icon: RiCustomerServiceLine, path: '/customer/service' },
  { label: 'Profile', icon: RiUserLine, path: '/customer/settings' },
];

export default function CustomerLayout() {
  const { user } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isBasePage = location.pathname === '/customer';

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-white">
        {/* Simple header */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 -ml-1 text-content-secondary hover:bg-surface-hover transition-colors"
              title="Go Back"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-none bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="text-sm font-semibold text-content-primary">{APP_NAME}</span>
          </div>
          <button className="relative p-2 rounded-none text-content-secondary hover:bg-surface-hover">
            <RiNotification3Line className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-brand-pink text-white text-[9px] font-bold rounded-none flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>
        <BottomNav items={bottomNavItems} />
      </div>
    </SidebarProvider>
  );
}
