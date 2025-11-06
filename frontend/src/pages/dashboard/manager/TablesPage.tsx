import { useSessionStore } from '@/store/sessionStore';
import { useBranches, useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { ManagerTableManagementEnhanced } from '@/components/manager/ManagerTableManagementEnhanced';
import { getLocalStorageObject } from '@/utils/typeCast';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { StaffAccountDTO } from '@/dto/staff.dto';

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function TablesPage() {
  const { user } = useSessionStore();
  
  // Get restaurant ID from localStorage to filter branches by restaurant (same as Owner)
  const selectedRestaurant: RestaurantDTO | null = useMemo(() => {
    return getLocalStorageObject<RestaurantDTO>("selected_restaurant");
  }, []);
  
  // Use branchesByRestaurant if restaurantId is available, otherwise useBranches
  const branchesByRestaurantQuery = useBranchesByRestaurant(selectedRestaurant?.restaurantId);
  const allBranchesQuery = useBranches();
  
  // Use branchesByRestaurant if restaurantId is available, otherwise use all branches
  const { data: branches = [] } = selectedRestaurant?.restaurantId
    ? branchesByRestaurantQuery
    : allBranchesQuery;
  
  const [branchId, setBranchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Try to get branchId from user (StaffAccountDTO has branchId)
    if (user && 'branchId' in user && user.branchId) {
      const userBranchId = String(user.branchId);
      // Only use if it's a valid UUID
      if (isValidUUID(userBranchId)) {
        setBranchId(userBranchId);
        return;
      }
    }
    
    // Fallback to first branch if user doesn't have valid branchId
    if (branches.length > 0 && branches[0].branchId) {
      const firstBranchId = String(branches[0].branchId);
      if (isValidUUID(firstBranchId)) {
        setBranchId(firstBranchId);
      }
    }
  }, [user, branches]);

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
