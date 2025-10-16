import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MenuManagement } from '@/components/owner/MenuManagement';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

const OwnerMenuPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState<any>(null);
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

    if (brandBranches.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This brand has no branches yet.',
      });
      navigate('/brand-selection');
      return;
    }

    setActiveBranch(brandBranches[0]);
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeBranch) {
    return null;
  }

  return <MenuManagement branchId={activeBranch.id} />;
};

export default OwnerMenuPage;
