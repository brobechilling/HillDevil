import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCustomizations, useCreateCustomization } from '@/hooks/queries/useCustomizations';
import { useUpdateCategory, useCategory } from '@/hooks/queries/useCategories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  restaurantId: string;
}

export const CategoryManagementDialog = ({
  open,
  onOpenChange,
  categoryId,
  restaurantId,
}: Props) => {
  const { data: allCustomizations = [] } = useCustomizations();
  const { data: category } = useCategory(categoryId);
  const createMutation = useCreateCustomization();
  const updateCategoryMutation = useUpdateCategory();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Load linked customizations
  useEffect(() => {
    if (open && category?.customizationIds) {
      setSelectedIds(category.customizationIds);
    } else {
      setSelectedIds([]);
    }
  }, [open, category]);

  const handleToggle = (custId: string, checked: boolean) => {
    const newIds = checked
      ? [...selectedIds, custId]
      : selectedIds.filter(id => id !== custId);

    setSelectedIds(newIds);
    if (!category) return;
    updateCategoryMutation.mutate({
      id: categoryId,
      data: { ...category, customizationIds: newIds }
    });
  };

  const handleAddNew = () => {
    if (!newName.trim()) return toast({ variant: 'destructive', title: 'Name required' });

    createMutation.mutate({
      name: newName,
      price: newPrice || '0',
      restaurantId,
    }, {
      onSuccess: (newCust) => {
        const newIds = [...selectedIds, newCust.customizationId];
        if (category) {
          updateCategoryMutation.mutate({
            id: categoryId,
            data: { ...category, customizationIds: newIds }
          });
        }
        setNewName('');
        setNewPrice('');
        setShowAddForm(false);
        toast({ title: 'Added', description: 'Customization created and linked.' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Manage Customizations</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {category?.name} – Select applicable customizations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New */}
          {!showAddForm ? (
            <Button variant="outline" className="w-full h-9" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Customization
            </Button>
          ) : (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <h4 className="font-semibold text-sm">New Customization</h4>
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-9"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddNew} disabled={createMutation.isPending} className="h-8">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewPrice('');
                }} className="h-8">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {allCustomizations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customizations yet.</p>
            ) : (
              allCustomizations.map(cust => (
                <div
                  key={cust.customizationId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedIds.includes(cust.customizationId)}
                      onCheckedChange={(checked) => handleToggle(cust.customizationId, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{cust.name}</span>
                        {parseFloat(cust.price) > 0 && (
                          <Badge variant="secondary" className="text-[11px]">+${parseFloat(cust.price).toFixed(2)}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};