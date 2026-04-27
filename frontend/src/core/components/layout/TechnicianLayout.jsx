import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { RiCustomerServiceLine, RiUserLine } from 'react-icons/ri';

const technicianBottomNav = [
  { path: '/tech-portal', label: 'My Tickets', icon: RiCustomerServiceLine, exact: true },
  { path: '/tech-portal/profile', label: 'Profile', icon: RiUserLine },
];

export default function TechnicianLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-primary">
        <Sidebar role="admin" subRole="technician" />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto pb-20">
            <Outlet />
          </main>
          <div className="lg:hidden">
            <BottomNav items={technicianBottomNav} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
