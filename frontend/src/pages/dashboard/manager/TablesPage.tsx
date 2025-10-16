import { useAuthStore } from '@/store/authStore';
import { ManagerTableManagementEnhanced } from '@/components/manager/ManagerTableManagementEnhanced';

export default function TablesPage() {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Table Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage table status, areas, and view reservations
        </p>
      </div>

      <ManagerTableManagementEnhanced branchId={branchId} />
    </div>
  );
}
