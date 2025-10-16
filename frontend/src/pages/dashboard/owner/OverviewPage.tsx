import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { OverviewDashboard } from '@/components/owner/OverviewDashboard';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OwnerOverviewPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [userBranches, setUserBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }

    const selectedBrand = localStorage.getItem('selected_brand');
    if (!selectedBrand) {
      toast({
        variant: 'destructive',
        title: 'No brand selected',
        description: 'Please select a brand first.',
      });
      navigate('/brand-selection');
      return;
    }

    const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const brandBranches = allBranches.filter((b: any) =>
      b.brandName === selectedBrand && b.ownerId === user.id
    );

    // It's valid for a brand to have no branches yet. Allow the page to render
    // with an empty branches array so the owner can create the first branch from
    // the OverviewDashboard.
    setUserBranches(brandBranches);
    setLoading(false);
  }, [user, navigate]);

  const handleChooseBrand = () => {
    localStorage.removeItem('selected_brand');
    navigate('/brand-selection');
  };

  const handleBranchUpdate = () => {
    // Reload branches after update
    const selectedBrand = localStorage.getItem('selected_brand');
    const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const brandBranches = allBranches.filter((b: any) =>
      b.brandName === selectedBrand && b.ownerId === user?.id
    );
    setUserBranches(brandBranches);
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
