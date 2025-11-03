import { useNavigate } from 'react-router-dom';
import { UserDTO } from '@/dto/user.dto';
import { OverviewDashboard } from '@/components/owner/OverviewDashboard';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';

const OwnerOverviewPage = () => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as UserDTO;
    setUser(userData);

    if (userData.role.name !== 'RESTAURANT_OWNER') {
      navigate('/login');
      return;
    }

    const selectedRestaurant = localStorage.getItem('selected_restaurant');
    if (!selectedRestaurant) {
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/brand-selection');
      return;
    }

    setLoading(false);
  }, [navigate]);

  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId = selectedRestaurant?.restaurantId;

  const branchesQuery = useBranchesByRestaurant(restaurantId);
  const allBranches = branchesQuery.data ?? [];

  const handleBranchUpdate = () => {
    branchesQuery.refetch();
  };

  const handleChooseBrand = () => {
    localStorage.removeItem('selected_restaurant');
    navigate('/brand-selection');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (branchesQuery.isLoading) {
    return <div className="text-center py-8">Loading branches...</div>;
  }

  if (branchesQuery.isError) {
    return <div className="text-center py-8 text-destructive">Failed to load branches.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleChooseBrand}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Choose Another Restaurant
        </Button>
      </div>

      <OverviewDashboard
        userBranches={allBranches}  
        onBranchUpdate={handleBranchUpdate}
      />
    </div>
  );
};

export default OwnerOverviewPage;