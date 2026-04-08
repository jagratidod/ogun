import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  RiDashboardLine, RiBox3Line, RiShoppingCartLine,
  RiTrophyLine, RiMenuLine
} from 'react-icons/ri';

const bottomNavItems = [
  { label: 'Home', icon: RiDashboardLine, path: '/distributor', exact: true },
  { label: 'Stock', icon: RiBox3Line, path: '/distributor/stock' },
  { label: 'Orders', icon: RiShoppingCartLine, path: '/distributor/orders' },
  { label: 'Rewards', icon: RiTrophyLine, path: '/distributor/rewards' },
  { label: 'More', icon: RiMenuLine, path: '/distributor/settings' },
];

export default function DistributorLayout() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-primary">
        {!isMobile && <Sidebar role="distributor" />}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar />
          <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
            <Outlet />
          </main>
          {isMobile && <BottomNav items={bottomNavItems} />}
        </div>
      </div>
    </SidebarProvider>
  );
}
