import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { ManagerTableManagementEnhanced } from '@/components/manager/ManagerTableManagementEnhanced';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches, useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { UserDTO } from '@/dto/user.dto';
import { ROLE_NAME } from '@/dto/user.dto';
import { getLocalStorageObject } from '@/utils/typeCast';
import { RestaurantDTO } from '@/dto/restaurant.dto';

const OwnerTablesPage = () => {
  const { user } = useSessionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  
  const selectedRestaurant: RestaurantDTO | null = getLocalStorageObject<RestaurantDTO>("selected_restaurant");
  const { data: branches = [], isLoading: isBranchesLoading } = selectedRestaurant?.restaurantId
    ? useBranchesByRestaurant(selectedRestaurant.restaurantId)
    : useBranches();

  useEffect(() => {
    // Check if user exists and has RESTAURANT_OWNER role
    if (!user) {
      navigate('/login');
      return;
    }

    // Handle both UserDTO (from backend) and mock user formats
    const userRole = (user as UserDTO).role?.name || (user as any).role;
    const isOwner = userRole === ROLE_NAME.RESTAURANT_OWNER || userRole === 'owner';
    
    if (!isOwner) {
      navigate('/login');
      return;
    }

    if (isBranchesLoading) {
      return;
    }

    // Check for branchId from location state (when navigating from BranchSelectionPage)
    const branchIdFromState = (location.state as any)?.branchId;
    if (branchIdFromState) {
      setSelectedBranchId(String(branchIdFromState));
      // Also save to sessionStorage for persistence
      sessionStorage.setItem('owner_selected_branch_id', String(branchIdFromState));
      return;
    }

    // Check for branchId from sessionStorage (for persistence when navigating back)
    const savedBranchId = sessionStorage.getItem('owner_selected_branch_id');
    if (savedBranchId && savedBranchId !== 'undefined' && savedBranchId.trim() !== '') {
      // Verify the branch still exists
      const branchExists = branches.some(b => String(b.branchId) === savedBranchId);
      if (branchExists) {
        setSelectedBranchId(savedBranchId);
        return;
      } else {
        // Branch no longer exists, clear it
        sessionStorage.removeItem('owner_selected_branch_id');
      }
    }

    // Check for selected_restaurant
    if (!selectedRestaurant) {
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/brand-selection');
      return;
    }

    if (branches.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This restaurant has no branches yet.',
      });
      navigate('/dashboard/owner/branch-selection');
      return;
    }
  }, [user, navigate, branches, isBranchesLoading, location.state, selectedRestaurant]);

  if (isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Owner sẽ dùng ManagerTableManagementEnhanced với Select Branch
  // Component này có view reservations, update status, nhưng không có delete/CRUD đầy đủ
  // Owner có quyền Select Branch và KHÔNG có Add Area/Add Table
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Table Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage table status, areas, and view reservations
        </p>
      </div>
      <ManagerTableManagementEnhanced 
        branchId={selectedBranchId}
        allowBranchSelection={true} 
        hideAddButtons={true} 
        disableStatusChange={true} 
      />
    </div>
  );
};

export default OwnerTablesPage;