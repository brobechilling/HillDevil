import { useNavigate } from 'react-router-dom';
import { ReportsAnalytics } from '@/components/owner/ReportsAnalytics';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/queries/useBranches';
import { BranchDTO } from '@/dto/branch.dto';

const OwnerReportsPage = () => {
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState<BranchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get selected restaurant from localStorage
  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  
  const { data: branches, isLoading: isBranchesLoading } = useBranches();

  useEffect(() => {
    if (isBranchesLoading) {
      return;
    }

    // Check if restaurant is selected
    if (!selectedRestaurant) {
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/dashboard/owner');
      return;
    }

    // Filter branches by selected restaurant
    const restaurantBranches = (branches || []).filter(
      (branch) => branch.restaurantId === selectedRestaurant.restaurantId
    );

    if (restaurantBranches.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This restaurant has no branches yet. Please create a branch first.',
      });
      navigate('/dashboard/owner');
      return;
    }

    setActiveBranch(restaurantBranches[0]);
    setLoading(false);
  }, [navigate, branches, isBranchesLoading, selectedRestaurant]);

  if (loading || isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeBranch) {
    return null;
  }

  return <ReportsAnalytics branchId={String(activeBranch.branchId)} />;
};

export default OwnerReportsPage;
