import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  RiNotification3Fill, RiArrowLeftSLine, RiHome4Fill, 
  RiStackFill, RiCustomerService2Fill, RiUserFill, RiCompass3Fill 
} from 'react-icons/ri';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { APP_NAME } from '../../utils/constants';

const bottomNavItems = [
  { label: 'Home', icon: RiHome4Fill, path: '/customer', exact: true },
  { label: 'Explore', icon: RiCompass3Fill, path: '/customer/social' },
  { label: 'Products', icon: RiStackFill, path: '/customer/products' },
  { label: 'Service', icon: RiCustomerService2Fill, path: '/customer/service' },
  { label: 'Profile', icon: RiUserFill, path: '/customer/settings' },
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
        {/* Simple header - Hidden on Home Page for custom boutique header */}
        {!isBasePage && (
          <header className="sticky top-0 z-30 bg-gradient-to-b from-brand-teal/30 via-brand-teal/10 to-white/95 backdrop-blur-xl border-b border-gray-50/50 px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-gray-800 transition-all active:scale-90"
                  title="Go Back"
                >
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-none uppercase tracking-widest">{location.pathname.split('/').pop().toUpperCase()}</span>
                  <span className="text-[7px] text-brand-teal font-black uppercase tracking-[0.3em] mt-1 opacity-70">Ogun Boutique</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-gray-300 transition-all">
                  <RiNotification3Fill className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-pink rounded-full border border-white" />
                  )}
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
        <BottomNav items={bottomNavItems} />
      </div>
    </SidebarProvider>
  );
}
