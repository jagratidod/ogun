import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Topbar from './Topbar';
import { SidebarProvider } from '../../context/SidebarContext';
import {
  RiDashboardLine, RiShoppingBagLine, RiBox3Line,
  RiTrophyLine, RiUserLine, RiQuestionAnswerLine
} from 'react-icons/ri';

const bottomNavItems = [
  { label: 'Home', icon: RiDashboardLine, path: '/retailer', exact: true },
  { label: 'Market', icon: RiShoppingBagLine, path: '/retailer/marketplace' },
  { label: 'Orders', icon: RiShoppingBagLine, path: '/retailer/orders' },
  { label: 'Requests', icon: RiQuestionAnswerLine, path: '/retailer/queries' },
  { label: 'Sell', icon: RiShoppingBagLine, path: '/retailer/sales' },
  { label: 'Stock', icon: RiBox3Line, path: '/retailer/stock' },
  { label: 'Profile', icon: RiUserLine, path: '/retailer/settings' },
];

export default function RetailerLayout() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-surface-primary">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>
        <BottomNav items={bottomNavItems} />
      </div>
    </SidebarProvider>
  );
}
