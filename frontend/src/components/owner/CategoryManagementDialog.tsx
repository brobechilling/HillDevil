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
import { Checkbox } from '@/components/ui/checkbox';
import { useMenuCustomizationStore, Customization } from '@/store/customizationStore';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  branchId: string;
}

export const CategoryManagementDialog = ({
  open,
  onOpenChange,
  categoryName,
  branchId,
}: CategoryManagementDialogProps) => {
  const {
    customizations,
    getCustomizationsByBranch,
    getCategoryCustomizations,
    linkCategoryCustomization,
    unlinkCategoryCustomization,
    addCustomization,
  } = useMenuCustomizationStore();

  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [showAddCustomization, setShowAddCustomization] = useState(false);
  const [newCustomizationName, setNewCustomizationName] = useState('');
  const [newCustomizationPrice, setNewCustomizationPrice] = useState('');

  const allCustomizations = getCustomizationsByBranch(branchId);
  const categoryCustomizations = getCategoryCustomizations(categoryName, branchId);

  useEffect(() => {
    if (open) {
      const linkedIds = new Set(categoryCustomizations.map((c) => c.id));
      setSelectedCustomizations(linkedIds);
    }
  }, [open, categoryCustomizations]);

  const handleToggleCustomization = (customizationId: string, isChecked: boolean) => {
    const newSelected = new Set(selectedCustomizations);
    if (isChecked) {
      newSelected.add(customizationId);
      linkCategoryCustomization(categoryName, customizationId, branchId);
    } else {
      newSelected.delete(customizationId);
      unlinkCategoryCustomization(categoryName, customizationId, branchId);
    }
    setSelectedCustomizations(newSelected);
  };

  const handleAddNewCustomization = () => {
    if (!newCustomizationName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a customization name.',
      });
      return;
    }

    const price = parseFloat(newCustomizationPrice) || 0;
    addCustomization({
      id: crypto.randomUUID(),
      name: newCustomizationName.trim(),
      price,
      branchId,
      options: [],
    });

    toast({
      title: 'Customization added',
      description: 'New customization has been created.',
    });

    setNewCustomizationName('');
    setNewCustomizationPrice('');
    setShowAddCustomization(false);
  };

  const handleSave = () => {
    toast({
      title: 'Category updated',
      description: `Customizations for ${categoryName} have been updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Category: {categoryName}</DialogTitle>
          <DialogDescription>
            Select which customizations apply to this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddCustomization ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddCustomization(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Customization
            </Button>
          ) : (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <h4 className="font-semibold text-sm">Create New Customization</h4>
              <div className="space-y-2">
                <Label htmlFor="customization-name">Name</Label>
                <Input
                  id="customization-name"
                  value={newCustomizationName}
                  onChange={(e) => setNewCustomizationName(e.target.value)}
                  placeholder="e.g., Extra Topping"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customization-price">Additional Price ($)</Label>
                <Input
                  id="customization-price"
                  type="number"
                  step="0.01"
                  value={newCustomizationPrice}
                  onChange={(e) => setNewCustomizationPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNewCustomization} size="sm">
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowAddCustomization(false);
                    setNewCustomizationName('');
                    setNewCustomizationPrice('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Available Customizations</h4>
            {allCustomizations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No customizations available. Create one above.
              </p>
            ) : (
              <div className="space-y-2">
                {allCustomizations.map((customization) => (
                  <div
                    key={customization.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id={`custom-${customization.id}`}
                        checked={selectedCustomizations.has(customization.id)}
                        onCheckedChange={(checked) =>
                          handleToggleCustomization(customization.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`custom-${customization.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customization.name}</span>
                          {customization.price > 0 && (
                            <Badge variant="secondary">+${customization.price.toFixed(2)}</Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
