import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { useStaffStore, StaffMember } from '@/store/staffStore';
import { StaffDialog } from './StaffDialog';
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

interface StaffManagementProps {
  branchId: string;
}

export const StaffManagement = ({ branchId }: StaffManagementProps) => {
  const allStaff = useStaffStore((state) => state.staff);
const staff = allStaff.filter(s => s.branchId === branchId);
  const deleteStaff = useStaffStore((state) => state.deleteStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>();
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedStaff(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    setStaffToDelete(null);
    toast({
      title: 'Staff Member Deleted',
      description: 'The staff member has been removed.',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Manage your branch staff members</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No staff members yet. Add your first staff member!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map((member) => (
                <Card key={member.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg">{member.name}</h4>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                          <Badge variant="outline">
                            {member.role === 'receptionist' ? 'Receptionist' : member.role === 'manager' ? 'Manager' : 'Waiter'}
                          </Badge>
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
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setStaffToDelete(member.id)}
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

      <StaffDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        staff={selectedStaff}
      />

      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => staffToDelete && handleDelete(staffToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
