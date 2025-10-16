import { useState, useEffect } from 'react';
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
import { useMenuCustomizationStore, Customization } from '@/store/customizationStore';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
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

interface CustomizationManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  customization?: Customization;
}

export const CustomizationManagementDialog = ({
  open,
  onOpenChange,
  branchId,
  customization,
}: CustomizationManagementDialogProps) => {
  const { addCustomization, updateCustomization, deleteCustomization } = useMenuCustomizationStore();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && customization) {
      setName(customization.name);
      setPrice(customization.price.toString());
    } else if (open) {
      setName('');
      setPrice('');
    }
  }, [open, customization]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a customization name.',
      });
      return;
    }

    const priceValue = parseFloat(price) || 0;

    if (customization) {
      updateCustomization(customization.id, {
        name: name.trim(),
        price: priceValue,
      });
      toast({
        title: 'Customization updated',
        description: 'The customization has been updated successfully.',
      });
    } else {
      addCustomization({
        id: `cust_${Date.now()}`,
        name: name.trim(),
        price: priceValue,
        branchId,
        options: [],
      });
      toast({
        title: 'Customization added',
        description: 'The customization has been added successfully.',
      });
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (customization) {
      deleteCustomization(customization.id);
      toast({
        title: 'Customization deleted',
        description: 'The customization has been removed.',
      });
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {customization ? 'Edit Customization' : 'Add Customization'}
            </DialogTitle>
            <DialogDescription>
              {customization ? 'Update the customization details' : 'Create a new customization option'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Extra Cheese, Large Size"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Additional Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-2 pt-4">
              {customization && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {customization ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customization? This action cannot be undone.
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
