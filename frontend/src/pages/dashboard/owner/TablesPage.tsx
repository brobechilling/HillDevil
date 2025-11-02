import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { TableManagementReadOnlyByFloor } from '@/components/owner/TableManagementReadOnlyByFloor';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/queries/useBranches';
import { UserDTO } from '@/dto/user.dto';
import { ROLE_NAME } from '@/dto/user.dto';

const OwnerTablesPage = () => {
  const { user } = useSessionStore();
  const navigate = useNavigate();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();

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