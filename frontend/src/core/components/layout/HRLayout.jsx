import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider } from '../../context/SidebarContext';

export default function HRLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-primary">
        <Sidebar role="admin" subRole="hr_manager" />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
