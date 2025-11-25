import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createBranch, updateBranch } from '@/api/branchApi';
import { Clock } from 'lucide-react';

interface BranchManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: any;
  onSave: () => void;
}

export const BranchManagementDialog = ({ open, onOpenChange, branch, onSave }: BranchManagementDialogProps) => {
  const [formData, setFormData] = useState({
    address: '',
    branchPhone: '',
    mail: '',
    openingHour: '',
    openingMinute: '',
    closingHour: '',
    closingMinute: '',
  });

  useEffect(() => {
    // Initialize form when dialog opens or branch changes.
    // When creating a new branch (branch === undefined) we must present an empty form.
    if (!open) return;

    if (branch) {
      const parseTime = (time: string | undefined) => {
        if (!time) return { hour: '', minute: '' };
        const [h, m] = time.split(':');
        return { hour: h || '', minute: m || '' };
      };

      const open = parseTime(branch.openingTime);
      const close = parseTime(branch.closingTime);

      setFormData({
        address: branch.address || '',
        branchPhone: branch.branchPhone || branch.phone || '',
        mail: branch.mail || branch.email || '',
        openingHour: open.hour,
        openingMinute: open.minute,
        closingHour: close.hour,
        closingMinute: close.minute,
      });
    } else {
      // Create mode: ensure form is cleared whenever dialog opens for a new branch
      setFormData({
        address: '',
        branchPhone: '',
        mail: '',
        openingHour: '',
        openingMinute: '',
        closingHour: '',
        closingMinute: '',
      });
    }
  }, [branch, open]);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address || !formData.mail) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Address and email (mail) are required.',
      });
      return;
    }

    const openingTime = formData.openingHour && formData.openingMinute
      ? `${formData.openingHour}:${formData.openingMinute}`
      : undefined;

    const closingTime = formData.closingHour && formData.closingMinute
      ? `${formData.closingHour}:${formData.closingMinute}`
      : undefined;

    // Validate opening and closing times are required
    if (!openingTime || !closingTime) {
      toast({
        variant: 'destructive',
        title: 'Missing hours',
        description: 'Opening time and closing time are required.',
      });
      return;
    }

    // Validate closing time is after opening time
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    if (toMinutes(closingTime) <= toMinutes(openingTime)) {
      toast({
        variant: 'destructive',
        title: 'Invalid hours',
        description: 'Closing time must be after opening time.',
      });
      return;
    }

    const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
    const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
    const restaurantId = selectedRestaurant?.restaurantId;

    if (!restaurantId) {
      toast({ variant: 'destructive', title: 'No restaurant selected', description: 'Please select a restaurant first.' });
      return;
    }

    const payload: any = {
      restaurantId,
      address: formData.address,
      branchPhone: formData.branchPhone || undefined,
      mail: formData.mail,
      openingTime,
      closingTime,
      isActive: true,
    };

    (async () => {
      try {
        if (branch) {
          const updatePayload = {
            restaurantId,
            address: formData.address,
            branchPhone: formData.branchPhone || undefined,
            mail: formData.mail,
            openingTime,
            closingTime,
          };
          await updateBranch(branch.branchId, updatePayload);
          toast({ title: 'Branch updated', description: 'Branch information has been updated successfully.' });
        } else {
          await createBranch(payload);
          toast({ title: 'Branch created', description: 'Branch has been added successfully.' });
        }
        onSave();
        onOpenChange(false);
      } catch (err: any) {
        console.error('Branch save error', err);
        toast({ variant: 'destructive', title: 'Error', description: err?.response?.data?.message || 'Failed to save branch.' });
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          <DialogDescription>
            {branch ? 'Update branch information' : 'Add a new branch to your brand'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1">
              <span className="text-red-500">*</span> Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchPhone">Phone</Label>
              <Input
                id="branchPhone"
                value={formData.branchPhone}
                onChange={(e) => setFormData({ ...formData, branchPhone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail" className="flex items-center gap-1">
                <span className="text-red-500">*</span> Email (mail)
              </Label>
              <Input
                id="mail"
                type="email"
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                placeholder="branch@restaurant.com"
              />
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Business Hours</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Opening */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Open:</span>
                <div className="flex gap-1">
                  <Select value={formData.openingHour} onValueChange={(val) => setFormData({ ...formData, openingHour: val })}>
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select value={formData.openingMinute} onValueChange={(val) => setFormData({ ...formData, openingMinute: val })}>
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-8 h-px bg-border" />

              {/* Closing */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Close:</span>
                <div className="flex gap-1">
                  <Select value={formData.closingHour} onValueChange={(val) => setFormData({ ...formData, closingHour: val })}>
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select value={formData.closingMinute} onValueChange={(val) => setFormData({ ...formData, closingMinute: val })}>
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Times are in 5-minute increments. Closing time must be after opening time.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-32">
              {branch ? 'Update' : 'Create'} Branch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};