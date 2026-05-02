import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider } from '../../context/SidebarContext';

export default function LogisticsLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-primary">
        <Sidebar role="logistics" />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar title="Logistics Control Plane" />
          <main className="flex-1 overflow-y-auto">
            <div className="container-padding">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
