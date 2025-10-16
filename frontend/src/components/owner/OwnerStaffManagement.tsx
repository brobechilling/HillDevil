import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, Mail, Phone, UserCog } from 'lucide-react';
import { useStaffStore, StaffMember } from '@/store/staffStore';
import { OwnerStaffDialog } from './OwnerStaffDialog';
import { toast } from '@/hooks/use-toast';
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
import { useNavigate } from 'react-router-dom';

interface OwnerStaffManagementProps {
  branchId: string;
}

export const OwnerStaffManagement = ({ branchId }: OwnerStaffManagementProps) => {
  const navigate = useNavigate();
  const allStaff = useStaffStore((state) => state.staff);
  const managers = allStaff.filter(s => s.role === 'manager' && s.branchId === branchId);
  const deleteStaff = useStaffStore((state) => state.deleteStaff);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>();

  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  // View manager details (read-only)
  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  // Add new manager
  const handleAdd = () => {
    setSelectedStaff(undefined);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    setStaffToDelete(null);
    toast({
      title: 'Manager Deleted',
      description: 'The manager has been removed.',
    });
  };

  const handleAccessManagerDashboard = () => {
    // Get all branches for the current branch info
    const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const selectedBranch = allBranches.find((b: any) => b.id === branchId);

    if (!selectedBranch) {
      toast({
        variant: 'destructive',
        title: 'Branch not found',
        description: 'The current branch could not be found.',
      });
      return;
    }

    // Store manager context
    sessionStorage.setItem('owner_viewing_as_manager', 'true');
    sessionStorage.setItem('manager_branch_id', branchId);
    sessionStorage.setItem('manager_branch_name', selectedBranch.name);

    // Create a temporary manager user context
    const user = JSON.parse(localStorage.getItem('mock_auth_user') || '{}');
    const originalUser = { ...user };
    sessionStorage.setItem('original_user', JSON.stringify(originalUser));

    user.branchId = branchId;
    user.role = 'branch_manager';
    localStorage.setItem('mock_auth_user', JSON.stringify(user));

    // Use window.location to force a full page reload with the new user context
    window.location.href = '/dashboard/manager';
  };

  // Get current branch info
  const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
  const currentBranch = allBranches.find((b: any) => b.id === branchId);

  return (
    <>
      <div className="space-y-6">
        {/* Access Manager Dashboard Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Access Manager Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  View and manage operations for <span className="font-semibold text-foreground">{currentBranch?.name || 'this branch'}</span> from the manager's perspective.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  You can create waiter and receptionist accounts there.
                </p>
                <Button onClick={handleAccessManagerDashboard} variant="default">
                  <UserCog className="mr-2 h-4 w-4" />
                  Open Manager Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manager Accounts Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manager Accounts</CardTitle>
                <CardDescription>Create and manage branch manager accounts</CardDescription>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manager
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {managers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-muted mb-4">
                  <UserCog className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No managers yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first manager to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {managers.map((member) => (
                  <Card key={member.id} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg">{member.name}</h4>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">Manager</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <span className="font-medium">Username:</span> {member.username}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {/* View Button (Read-only) */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleView(member)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setStaffToDelete(member.id)}
                            title="Delete Manager"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>

      {/* Staff Dialog with mode support */}
      <OwnerStaffDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        staff={selectedStaff}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manager? This action cannot be undone.
              The manager will lose access to the system immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => staffToDelete && handleDelete(staffToDelete)}
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