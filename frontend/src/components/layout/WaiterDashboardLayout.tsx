import { Outlet } from 'react-router-dom';
import { WaiterSidebar } from './WaiterSidebar';

export const WaiterDashboardLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <WaiterSidebar />
      <main className="flex-1 overflow-auto ml-72 p-6 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
