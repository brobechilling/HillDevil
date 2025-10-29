import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ManagerTables } from '@/components/manager/ManagerTables';
import { useBranches } from '@/hooks/queries/useBranches';
import { BranchDTO } from '@/dto/branch.dto';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ManagerTablesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeBranch, setActiveBranch] = useState<BranchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: branches, isLoading: isBranchesLoading } = useBranches();

  useEffect(() => {
    if (!user || (user.role !== 'branch_manager' && user.role !== 'owner')) {
      navigate('/login');
      return;
    }

    if (isBranchesLoading) {
      return;
    }

    // Get active branch from session or localStorage
    const activeFromSession = sessionStorage.getItem('manager_branch_id');
    if (activeFromSession && branches) {
      const branch = branches.find(b => b.branchId === activeFromSession);
      if (branch) {
        setActiveBranch(branch);
        setLoading(false);
        return;
      }
    }

    // Fall back to first branch
    if (branches && branches.length > 0) {
      setActiveBranch(branches[0]);
      sessionStorage.setItem('manager_branch_id', branches[0].branchId);
      setLoading(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'You have no branches assigned.',
      });
      setLoading(false);
    }
  }, [user, navigate, branches, isBranchesLoading]);

  if (loading || isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeBranch || !branches) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">No branch selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground mt-2">Manage tables across your branch</p>
        </div>
        {branches.length > 1 && (
          <Select
            value={activeBranch.branchId}
            onValueChange={(branchId) => {
              const branch = branches.find(b => b.branchId === branchId);
              if (branch) {
                setActiveBranch(branch);
                sessionStorage.setItem('manager_branch_id', branch.branchId);
              }
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.branchId} value={branch.branchId}>
                  {branch.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ManagerTables branchId={activeBranch.branchId} />
    </div>
  );
};

export default ManagerTablesPage;