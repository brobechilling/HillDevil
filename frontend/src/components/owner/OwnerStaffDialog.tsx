import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffStore, StaffMember, StaffStatus } from '@/store/staffStore';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Eye, Mail, Phone, User, Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface OwnerStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  staff?: StaffMember; // For view mode only
  mode?: 'create' | 'view'; // Added mode prop
}

export const OwnerStaffDialog = ({ 
  open, 
  onOpenChange, 
  branchId, 
  staff,
  mode = 'create' 
}: OwnerStaffDialogProps) => {
  const addStaff = useStaffStore((state) => state.addStaff);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (staff && mode === 'view') {
      reset({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        status: staff.status,
        username: staff.username,
        password: staff.password,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        username: '',
        password: '',
      });
    }
  }, [staff, mode, reset]);

  const onSubmit = (data: StaffFormData) => {
    // Only allow creation, not updates
    if (mode === 'view') {
      toast({
        title: 'Action Not Allowed',
        description: 'Owners cannot edit manager accounts. Please delete and create a new one if needed.',
        variant: 'destructive',
      });
      return;
    }

    const staffData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'manager' as const,
      status: data.status,
      username: data.username,
      password: data.password,
      branchId: branchId,
    };

    addStaff(staffData);
    toast({
      title: 'Manager Created',
      description: 'The manager account has been created successfully.',
    });
    onOpenChange(false);
  };

  // View Mode - Read Only Display
  if (mode === 'view' && staff) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Manager Details</DialogTitle>
                  <DialogDescription>View manager account information</DialogDescription>
                </div>
              </div>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{staff.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{staff.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{staff.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium capitalize">{staff.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Login Credentials
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{staff.username}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">••••••••</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Owner Permissions
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    As an owner, you can view and delete manager accounts, but cannot edit them. 
                    To update manager details, please delete and create a new account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Create Mode - Editable Form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Manager</DialogTitle>
              <DialogDescription>Create a new manager account for this branch</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input {...register('name')} id="name" placeholder="John Doe" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input {...register('email')} id="email" type="email" placeholder="john@restaurant.com" />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input {...register('phone')} id="phone" placeholder="+1 234 567 8900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setValue('status', value as StaffStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Login Credentials
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input {...register('username')} id="username" placeholder="johndoe" />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input {...register('password')} id="password" type="password" placeholder="••••••••" />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Manager</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};