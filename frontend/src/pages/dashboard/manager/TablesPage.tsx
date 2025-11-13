import { useSessionStore } from '@/store/sessionStore';
import { ManagerTableManagementEnhanced } from '@/components/manager/ManagerTableManagementEnhanced';
import { isStaffAccountDTO } from '@/utils/typeCast';

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function TablesPage() {
  const { user } = useSessionStore();
  
  // Get branchId from multiple sources (same as OverviewPage)
  const branchIdFromStore = isStaffAccountDTO(user) ? user.branchId : "";
  const branchIdFromSession = sessionStorage.getItem('owner_selected_branch_id') || "";
  const rawBranchId = branchIdFromStore || branchIdFromSession;
  
  // Validate branchId is a valid UUID
  const branchId = rawBranchId && isValidUUID(rawBranchId) ? rawBranchId : undefined;

  if (!branchId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage table status, areas, and view reservations
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Loading branch information...</p>
        </div>
      </div>
    );
  }

  // Manager sẽ dùng ManagerTableManagementEnhanced
  // Component này hiển thị tables theo area với các chức năng: view reservations, update status, Add Area/Add Table
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Table Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage table status, areas, and view reservations
        </p>
      </div>
      <ManagerTableManagementEnhanced 
        branchId={branchId} 
        allowBranchSelection={false} 
        hideAddButtons={false}
      />
    </div>
  );
}
