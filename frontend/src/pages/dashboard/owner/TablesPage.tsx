import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { OwnerTables } from '@/components/owner/OwnerTables';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/queries/useBranches';
import { BranchDTO } from '@/dto/branch.dto';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  if (!activeBranch || !branches) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground mt-2">Manage tables across your branches</p>
        </div>
        {branches.length > 1 && (
          <Select
            value={activeBranch.branchId}
            onValueChange={(branchId) => {
              const branch = branches.find(b => b.branchId === branchId);
              if (branch) {
                setActiveBranch(branch);
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

      <OwnerTables branchId={activeBranch.branchId} />
    </div>
  );
};

export default OwnerTablesPage;