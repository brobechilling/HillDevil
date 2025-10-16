import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Building2, Edit, Trash2, ExternalLink, Plus } from 'lucide-react';
import { BranchManagementDialog } from './BranchManagementDialog';
import { toast } from '@/hooks/use-toast';

interface BranchManagementCardProps {
  branches: any[];
  onUpdate: () => void;
}

export const BranchManagementCard = ({ branches, onUpdate }: BranchManagementCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setIsDialogOpen(true);
  };

  const handleDelete = (branchId: string) => {
    const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const updatedBranches = branches.filter((b: any) => b.id !== branchId);
    localStorage.setItem('mock_branches', JSON.stringify(updatedBranches));

    toast({
      title: 'Branch deleted',
      description: 'The branch has been removed successfully.',
    });

    setBranchToDelete(null);
    onUpdate();
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
              <p className="text-sm text-muted-foreground mb-4">You don't have any branches for this brand. Create your first branch to start accepting orders.</p>
              <div className="flex justify-center">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Branch
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {branches.map((branch) => (
                <Card key={branch.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{branch.name}</h3>
                          <Badge variant="outline">{branch.shortCode}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{branch.address}</p>
                        <p className="text-sm text-muted-foreground">{branch.phone}</p>
                        <a
                          href={`/branch/${branch.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                        >
                          View Public Page <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranchToDelete(branch.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      <AlertDialog open={!!branchToDelete} onOpenChange={() => setBranchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this branch? This will remove all associated data including tables, staff, and menu items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => branchToDelete && handleDelete(branchToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
