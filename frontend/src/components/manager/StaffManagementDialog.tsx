import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffStore, StaffRole } from '@/store/staffStore';
import { toast } from '@/hooks/use-toast';

interface StaffManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: any | null;
  branchId: string;
  onSuccess?: () => void;
}

export const StaffManagementDialog = ({ open, onOpenChange, staff, branchId, onSuccess }: StaffManagementDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'waiter' as StaffRole,
    username: '',
    password: '',
  });

  const { addStaff, updateStaff } = useStaffStore();

  // Populate form when editing
  useEffect(() => {
    if (staff && open) {
      setFormData({
        name: staff.name || '',
        role: staff.role || 'waiter',
        username: staff.username || '',
        password: '',
      });
    } else if (!open) {
      // Reset form when closing
      setFormData({
        name: '',
        role: 'waiter',
        username: '',
        password: '',
      });
    }
  }, [staff, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.username || (!staff && !formData.password)) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (staff) {
      // Update existing staff
      updateStaff(staff.id, {
        name: formData.name,
        role: formData.role,
        username: formData.username,
        ...(formData.password && { password: formData.password }),
      });

      toast({
        title: 'Staff member updated',
        description: `${formData.name}'s information has been updated.`,
      });
    } else {
      // Add new staff
      addStaff({
        branchId,
        name: formData.name,
        email: `${formData.username}@restaurant.com`, // Auto-generate email
        phone: '', // Not required anymore
        role: formData.role,
        username: formData.username,
        password: formData.password,
        status: 'active',
      });

      toast({
        title: 'Staff member added',
        description: `${formData.name} has been added as ${formData.role}.`,
      });
    }

    setFormData({
      name: '',
      role: 'waiter',
      username: '',
      password: '',
    });

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          <DialogDescription>
            {staff ? 'Update staff member information.' : 'Add a waiter or receptionist to your branch team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as StaffRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {!staff && '*'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={staff ? 'Leave blank to keep current' : '••••••••'}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{staff ? 'Update Staff Member' : 'Add Staff Member'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
