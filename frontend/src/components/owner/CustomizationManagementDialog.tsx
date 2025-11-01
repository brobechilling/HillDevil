// src/components/owner/CustomizationManagementDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCreateCustomization, useUpdateCustomization, useDeleteCustomization } from '@/hooks/queries/useCustomizations';
import { CustomizationDTO } from '@/dto/customization.dto';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  customization?: CustomizationDTO;
}

export const CustomizationManagementDialog = ({
  open,
  onOpenChange,
  restaurantId,
  customization,
}: Props) => {
  const createMutation = useCreateCustomization();
  const updateMutation = useUpdateCustomization();
  const deleteMutation = useDeleteCustomization();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (customization) {
      setName(customization.name);
      setPrice(customization.price);
    } else {
      setName('');
      setPrice('');
    }
  }, [customization, open]);

  const handleSave = () => {
    if (!name.trim()) return toast({ variant: 'destructive', title: 'Name required' });

    const payload = { name: name.trim(), price: price || '0', restaurantId };

    if (customization) {
      updateMutation.mutate({
        id: customization.customizationId,
        data: payload
      }, {
        onSuccess: () => {
          toast({ title: 'Updated', description: 'Customization saved.' });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: 'Created', description: 'Customization added.' });
          onOpenChange(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (customization) {
      deleteMutation.mutate(customization.customizationId, {
        onSuccess: () => {
          toast({ title: 'Deleted', description: 'Customization removed.' });
          setShowDelete(false);
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">{customization ? 'Edit' : 'Add'} Customization</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {customization ? 'Update details' : 'Create new option'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Extra Cheese" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Price ($)</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="h-9" />
            </div>

            <div className="flex gap-2 pt-4">
              {customization && (
                <Button variant="destructive" onClick={() => setShowDelete(true)} className="mr-auto h-9">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="h-9">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {customization ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customization?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};