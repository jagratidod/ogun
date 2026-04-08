import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';
import { RiNotification3Line } from 'react-icons/ri';
import { useNotificationContext } from '../../context/NotificationContext';
import {
  RiHome4Line, RiSmartphoneLine, RiCustomerServiceLine, RiUserLine
} from 'react-icons/ri';

const bottomNavItems = [
  { label: 'Home', icon: RiHome4Line, path: '/customer', exact: true },
  { label: 'Products', icon: RiSmartphoneLine, path: '/customer/products' },
  { label: 'Service', icon: RiCustomerServiceLine, path: '/customer/service' },
  { label: 'Profile', icon: RiUserLine, path: '/customer/settings' },
];

export default function CustomerLayout() {
  const { user } = useAuthContext();
  const { unreadCount } = useNotificationContext();

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-surface-primary">
        {/* Simple header */}
        <header className="sticky top-0 z-30 h-14 bg-surface-primary/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
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
