import { OverviewDashboard } from '@/components/owner/OverviewDashboard';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { useSessionStore } from '@/store/sessionStore';

const OwnerOverviewPage = () => {
  const { user } = useSessionStore();
  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId = selectedRestaurant?.restaurantId;

  const branchesQuery = useBranchesByRestaurant(restaurantId);

  const handleBranchUpdate = () => branchesQuery.refetch();

  const handleChooseBrand = () => {
    localStorage.removeItem('selected_restaurant');
    window.location.href = '/brand-selection';
  };

  if (!selectedRestaurant) {
    return (
      <div className="text-center py-8 text-destructive">
        No restaurant selected. Please select a restaurant first.
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
        userBranches={branchesQuery.data ?? []}
        onBranchUpdate={handleBranchUpdate}
      />
    </div>
  );
};

export default OwnerOverviewPage;