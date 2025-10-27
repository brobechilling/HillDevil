import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, ExternalLink, Plus } from 'lucide-react';
import { BranchManagementDialog } from './BranchManagementDialog';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { updateBranch } from '@/api/branchApi';

interface BranchManagementCardProps {
  branches: any[];
  onUpdate: () => void;
}

export const BranchManagementCard = ({ branches, onUpdate }: BranchManagementCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [optimisticState, setOptimisticState] = useState<Record<string, boolean>>({});

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedBranch(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Management
          </CardTitle>
          <CardDescription>Manage your restaurant branches</CardDescription>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any branches for this brand. Create your first branch to start accepting orders.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Branch
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {branches.map((branch) => {
                const branchId = String(branch.branchId || branch.id); // UUID string làm key
                const isOptimisticActive = optimisticState[branchId] ?? branch.isActive;

                return (
                  <Card key={branchId} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{branch.name || branch.address}</h3>
                            {branch.shortCode && (
                              <Badge variant="outline">{branch.shortCode}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{branch.address}</p>
                          {branch.phone && (
                            <p className="text-sm text-muted-foreground">{branch.phone}</p>
                          )}
                          {branch.shortCode && (
                            <a
                              href={`/branch/${branch.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                            >
                              View Public Page <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex gap-2 items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Active</span>
                            <Switch
                              aria-label={`toggle-branch-${branchId}`}
                              checked={isOptimisticActive}
                              disabled={!!processingIds[branchId]}
                              onCheckedChange={async (checked) => {
                                const id = branch.branchId || branch.id;

                                // Optimistic update
                                setOptimisticState((s) => ({ ...s, [branchId]: checked }));
                                setProcessingIds((s) => ({ ...s, [branchId]: true }));

                                try {
                                  // DÙ BẬT HAY TẮT → đều dùng updateBranch
                                  await updateBranch(id, { isActive: checked });

                                  toast({
                                    title: 'Success',
                                    description: `Branch ${checked ? 'activated' : 'deactivated'}`,
                                  });

                                  onUpdate(); // Refetch dữ liệu mới
                                } catch (err: any) {
                                  console.error('Toggle branch error:', err);
                                  // Revert optimistic state
                                  setOptimisticState((s) => ({ ...s, [branchId]: branch.isActive }));

                                  toast({
                                    variant: 'destructive',
                                    title: 'Error',
                                    description: err?.response?.data?.message || 'Could not update branch status',
                                  });
                                } finally {
                                  setProcessingIds((s) => {
                                    const copy = { ...s };
                                    delete copy[branchId];
                                    return copy;
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <BranchManagementDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        branch={selectedBranch}
        onSave={onUpdate}
      />
    </>
  );
};