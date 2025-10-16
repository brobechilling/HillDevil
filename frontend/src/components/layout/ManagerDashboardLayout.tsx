import { Outlet } from 'react-router-dom';
import { ManagerSidebar } from './ManagerSidebar';

export const ManagerDashboardLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <ManagerSidebar />
      <main className="flex-1 overflow-auto ml-72 p-6 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
