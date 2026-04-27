import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { SidebarProvider } from '../../context/SidebarContext';
import { RiCustomerServiceLine, RiUserLine, RiSettings3Line } from 'react-icons/ri';

const techManagerBottomNav = [
  { path: '/tech-manager', label: 'Tickets', icon: RiCustomerServiceLine, exact: true },
  { path: '/tech-manager/profile', label: 'Profile', icon: RiUserLine },
];

export default function TechnicianManagerLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-primary">
        <Sidebar role="admin" subRole="technician_manager" />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto pb-20">
            <Outlet />
          </main>
          <div className="lg:hidden">
            <BottomNav items={techManagerBottomNav} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
