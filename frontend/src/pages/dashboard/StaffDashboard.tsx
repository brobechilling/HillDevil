import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaFloorManagement } from '@/components/waiter/AreaFloorManagement';
import { MenuManagement } from '@/components/waiter/MenuManagement';
import { OrderManagement } from '@/components/waiter/OrderManagement';
import { useAuthStore } from '@/store/authStore';

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage tables, orders, and menu items
            {branchId && <span className="ml-2 text-sm">(Branch ID: {branchId})</span>}
          </p>
        </div>

        <Tabs defaultValue="area" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="area">Area / Floor</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="area" className="mt-6">
            <AreaFloorManagement />
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
