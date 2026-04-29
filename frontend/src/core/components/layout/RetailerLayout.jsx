import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAuthContext } from '../../context/AuthContext';
import {
  RiDashboardLine, RiShoppingBagLine, RiBox3Line,
  RiTrophyLine, RiUserLine, RiQuestionAnswerLine, RiCompass3Fill,
  RiArrowLeftSLine, RiNotification3Line, RiHandCoinLine, RiAddLine,
  RiStore2Line, RiFileList3Line
} from 'react-icons/ri';

const bottomNavItems = [
  { label: 'Home', icon: RiDashboardLine, path: '/retailer', exact: true },
  { label: 'Sales', icon: RiAddLine, path: '/retailer/sales' },
  { label: 'Market', icon: RiStore2Line, path: '/retailer/marketplace' },
  { label: 'Orders', icon: RiFileList3Line, path: '/retailer/orders' },
  { label: 'Stock', icon: RiBox3Line, path: '/retailer/stock' },
  { label: 'Profile', icon: RiUserLine, path: '/retailer/settings' },
];

export default function RetailerLayout() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/retailer';
  const pageTitle = location.pathname.split('/').pop().replace('-', ' ') || 'Retailer Portal';

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-surface-primary">
        {/* Simple header for Sub-pages */}
        {!isDashboard && (
          <header className="sticky top-0 z-30 bg-surface-primary/80 backdrop-blur-xl border-b border-border px-4 pt-3 pb-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-none bg-surface-hover border border-border active:scale-90 transition-all"
                >
                  <RiArrowLeftSLine className="w-5 h-5 text-content-primary" />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-[14px] font-black text-content-primary tracking-tight leading-none uppercase">{pageTitle}</h2>
                  <span className="text-[7px] text-brand-teal font-black uppercase tracking-widest mt-1">Retail Partner</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative w-8 h-8 flex items-center justify-center rounded-none bg-surface-hover border border-border text-content-tertiary">
                    <RiNotification3Line className="w-4.5 h-4.5" />
                 </div>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>
        <BottomNav items={bottomNavItems} />
      </div>
    </SidebarProvider>
  );
}
