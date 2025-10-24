import { useNavigate } from 'react-router-dom';
import { UserDTO } from '@/dto/user.dto';
import { OverviewDashboard } from '@/components/owner/OverviewDashboard';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OwnerOverviewPage = () => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const navigate = useNavigate();
  const [userBranches, setUserBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage (stored by Login component)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.log('OwnerOverviewPage - No user found, redirecting to login');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as UserDTO;
    setUser(userData);

    // Check if user has RESTAURANT_OWNER role
    if (userData.role.name !== 'RESTAURANT_OWNER') {
      console.log('OwnerOverviewPage - User is not RESTAURANT_OWNER, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if restaurant is selected
    const selectedRestaurant = localStorage.getItem('selected_restaurant');
    if (!selectedRestaurant) {
      console.log('OwnerOverviewPage - No restaurant selected, redirecting to brand selection');
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/brand-selection');
      return;
    }

    console.log('OwnerOverviewPage - User authenticated and restaurant selected');

    // For now, set empty branches array since we're using restaurant data
    // TODO: Implement branch management when backend supports it
    setUserBranches([]);
    setLoading(false);
  }, [navigate]);

  const handleChooseBrand = () => {
    localStorage.removeItem('selected_restaurant');
    navigate('/brand-selection');
  };

  const handleBranchUpdate = () => {
    // TODO: Implement branch update when backend supports it
    console.log('Branch update requested');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeBranch = userBranches[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleChooseBrand}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Choose Another Restaurant
        </Button>
      </div>
      <OverviewDashboard
        userBranches={userBranches}
        onBranchUpdate={handleBranchUpdate}
      />
    </div>
  );
};

export default OwnerOverviewPage;
