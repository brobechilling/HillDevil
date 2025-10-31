import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { TableManagementReadOnlyByFloor } from '@/components/owner/TableManagementReadOnlyByFloor';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/queries/useBranches';

const OwnerTablesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();

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

    if (branches.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This brand has no branches yet.',
      });
      navigate('/brand-selection');
      return;
    }
  }, [user, navigate, branches, isBranchesLoading]);

  if (isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <TableManagementReadOnlyByFloor allowBranchSelection={true} />;
};

export default OwnerTablesPage;