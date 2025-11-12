import { useNavigate } from 'react-router-dom';
import { MenuManagement } from '@/components/owner/MenuManagement';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { BranchDTO } from '@/dto/branch.dto';
import { useSessionStore } from '@/store/sessionStore';
import { UserDTO } from '@/dto/user.dto';

const OwnerMenuPage = () => {
  const { user, isAuthenticated, isLoading: isSessionLoading } = useSessionStore();
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState<BranchDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  const { data: branches, isLoading: isBranchesLoading } = useBranchesByRestaurant(restaurantId);


  useEffect(() => {
    if (isSessionLoading) return;

    const typedUser = user as UserDTO | null;
    if (!isAuthenticated || !typedUser || typedUser.role?.name !== 'RESTAURANT_OWNER') {
      // Do not redirect to login here during dev; let higher-level guards handle it
      setLoading(false);
      return;
    }

    if (!restaurantId) {
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/brand-selection');
      return;
    }

    if (isBranchesLoading) return;

    const restaurantBranches = branches || [];
    if (restaurantBranches.length === 0) {
      // this should display that there is no branch and ask them to create a branch instead of navigating to brand-selection 
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This restaurant has no branches yet.',
      });
      navigate('/brand-selection');
      return;
    }

    setActiveBranch(restaurantBranches[0]);
    setLoading(false);
  }, [isSessionLoading, isAuthenticated, user, restaurantId, isBranchesLoading, branches, navigate, toast]);

  if (isSessionLoading || loading || isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeBranch) {
    return null;
  }

  return <MenuManagement branchId={String(activeBranch.branchId)} />;
};

export default OwnerMenuPage;
