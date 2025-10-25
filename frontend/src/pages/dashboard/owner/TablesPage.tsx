import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { TableManagementReadOnlyByFloor } from '@/components/owner/TableManagementReadOnlyByFloor';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/queries/useBranches';
import { BranchDTO } from '@/dto/branch.dto';

const OwnerTablesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState<BranchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: branches, isLoading: isBranchesLoading } = useBranches();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }

    if (isBranchesLoading) {
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

    // Filter branches by restaurant (since we're now using real data)
    const brandBranches = branches || [];

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
  }, [user, navigate, branches, isBranchesLoading]);

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

  return <TableManagementReadOnlyByFloor allowBranchSelection={true} />;
};

export default OwnerTablesPage;
