import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, ExternalLink, Plus, AlertCircle } from 'lucide-react';
import { BranchManagementDialog } from './BranchManagementDialog';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useCanCreateBranch, useUpdateBranch } from '@/hooks/queries/useBranches';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BranchManagementCardProps {
  branches: any[];
  onUpdate: () => void;
}

export const BranchManagementCard = ({ branches, onUpdate }: BranchManagementCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'single' | 'all';
    branchId?: string;
    isActivating?: boolean;
  }>({ open: false, type: 'single' });

  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const canCreateBranchQuery = useCanCreateBranch(selectedRestaurant?.restaurantId);
  const updateBranchMutation = useUpdateBranch();

  const activeBranches = branches.filter(b => b.isActive);
  const inactiveBranches = branches.filter(b => !b.isActive);

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedBranch(null);
  };

  const handleToggleBranch = (branch: any, newStatus: boolean) => {
    setConfirmDialog({
      open: true,
      type: 'single',
      branchId: branch.branchId,
      isActivating: newStatus,
    });
  };

  const handleToggleAll = (isActivating: boolean) => {
    setConfirmDialog({
      open: true,
      type: 'all',
      isActivating,
    });
  };

  const confirmAction = async () => {
    const { type, branchId, isActivating } = confirmDialog;

    if (type === 'all') {
      const targetBranches = isActivating ? inactiveBranches : activeBranches;
      const updates = targetBranches.map(branch =>
        updateBranchMutation.mutateAsync({ id: branch.branchId, data: { isActive: isActivating! } }).catch(() => null)
      );
      await Promise.all(updates);
      toast({
        title: 'Success',
        description: `All branches ${isActivating ? 'activated' : 'inactivated'}.`,
      });
    } else if (branchId) {
      setProcessingIds(s => ({ ...s, [branchId]: true }));
      try {
        await updateBranchMutation.mutateAsync({ id: branchId, data: { isActive: isActivating! } });
        toast({
          title: 'Success',
          description: `Branch ${isActivating ? 'activated' : 'inactivated'}.`,
        });
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err?.response?.data?.message || 'Failed to update.',
        });
      } finally {
        setProcessingIds(s => {
          const copy = { ...s };
          delete copy[branchId];
          return copy;
        });
      }
    }

    setConfirmDialog({ open: false, type: 'single' });
    onUpdate();
  };

  const renderBranchItem = (branch: any) => {
    const branchId = String(branch.branchId);
    const isProcessing = !!processingIds[branchId];

    return (
      <Card key={branchId} className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{branch.address}</h3>
                {branch.shortCode && <Badge variant="outline">{branch.shortCode}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{branch.address}</p>
              {branch.branchPhone && (
                <p className="text-sm text-muted-foreground">{branch.branchPhone}</p>
              )}
              {(branch.openingTime || branch.closingTime) && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    🕐 {branch.openingTime || 'N/A'} - {branch.closingTime || 'N/A'}
                  </Badge>
                </div>
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
              <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
                <Edit className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={branch.isActive}
                  disabled={isProcessing}
                  onCheckedChange={(checked) => handleToggleBranch(branch, checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
                <Button 
                  onClick={() => {
                    if (!canCreateBranchQuery.data) {
                      toast({
                        variant: 'destructive',
                        title: 'Cannot create more branches',
                        description: 'Please upgrade your package to Premium to create more branches.',
                      });
                      return;
                    }
                    setIsDialogOpen(true);
                  }}
                  disabled={!canCreateBranchQuery.data}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Branch
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                  Active ({activeBranches.length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive ({inactiveBranches.length})
                </TabsTrigger>
              </TabsList>

              {/* === TAB ACTIVE === */}
              <TabsContent value="active" className="space-y-4 mt-4">
                {activeBranches.length > 0 && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-destructive/5">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Inactivate All Branches</p>
                      <p className="text-xs text-muted-foreground">
                        This will make all branches unavailable for orders.
                      </p>
                    </div>
                    <Switch
                      onCheckedChange={(checked) => checked && handleToggleAll(false)}
                      disabled={processingIds['all']}
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {activeBranches.map(renderBranchItem)}
                </div>
              </TabsContent>

              {/* === TAB INACTIVE === */}
              <TabsContent value="inactive" className="space-y-4 mt-4">
                {inactiveBranches.length > 0 && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Activate All Branches</p>
                      <p className="text-xs text-muted-foreground">
                        This will make all inactive branches available again.
                      </p>
                    </div>
                    <Switch
                      onCheckedChange={(checked) => checked && handleToggleAll(true)}
                      disabled={processingIds['all']}
                    />
                  </div>
                )}

                {inactiveBranches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No inactive branches.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {inactiveBranches.map(renderBranchItem)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <BranchManagementDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        branch={selectedBranch}
        onSave={onUpdate}
      />

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(s => ({ ...s, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'all'
                ? confirmDialog.isActivating
                  ? 'Activate All Branches?'
                  : 'Inactivate All Branches?'
                : confirmDialog.isActivating
                  ? 'Activate Branch?'
                  : 'Inactivate Branch?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'all'
                ? confirmDialog.isActivating
                  ? 'All inactive branches will become active and accept orders.'
                  : 'All active branches will be inactivated. Customers will not be able to place orders.'
                : confirmDialog.isActivating
                  ? 'This branch will become active and accept orders again.'
                  : 'This branch will be inactive. Are you sure you want to proceed?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {confirmDialog.isActivating ? 'Activate' : 'Inactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};