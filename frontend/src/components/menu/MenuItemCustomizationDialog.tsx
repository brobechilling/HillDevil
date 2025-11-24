import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useCustomizations, useCreateCustomization, useCreateCustomizationMenuItem } from '@/hooks/queries/useCustomizations';
import { useUpdateMenuItem, useMenuItem, useCustomizationsOfMenuItems } from '@/hooks/queries/useMenuItems';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItemId: string;
  restaurantId: string;
}

export const MenuItemCustomizationDialog = ({
  open,
  onOpenChange,
  menuItemId,
  restaurantId,
}: Props) => {
  const { data: allCustomizations = [] } = useCustomizations(restaurantId);
  const { data: menuItem } = useMenuItem(menuItemId);
  const createMutation = useCreateCustomizationMenuItem(menuItemId);
  const updateMenuItemMutation = useUpdateMenuItem();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const { data: customizations, isLoading } = useCustomizationsOfMenuItems(menuItemId, true);

  // Load linked customizations
  useEffect(() => {
    if (open && menuItem?.customizationIds) {
      setSelectedIds(menuItem.customizationIds);
    } else {
      setSelectedIds([]);
    }
  }, [open, menuItem]);

  const handleToggle = (custId: string, checked: boolean) => {
    const newIds = checked
      ? [...selectedIds, custId]
      : selectedIds.filter(id => id !== custId);

    setSelectedIds(newIds);
    // Chỉ update state, không gọi API ngay
  };

  const handleSave = () => {
    if (!menuItem) return;
    updateMenuItemMutation.mutate({
      id: menuItemId,
      data: {
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        bestSeller: menuItem.bestSeller,
        hasCustomization: menuItem.hasCustomization,
        restaurantId: menuItem.restaurantId,
        categoryId: menuItem.categoryId,
        customizationIds: selectedIds,
      },
      imageFile: undefined,
    }, {
      onSuccess: () => {
        toast({ 
          title: 'Updated', 
          description: 'Customizations have been updated successfully.' 
        });
        onOpenChange(false);
      },
      onError: () => {
        toast({ 
          variant: 'destructive',
          title: 'Error', 
          description: 'Failed to update customizations.' 
        });
      }
    });
  };

  const handleCancel = () => {
    // Reset state when canceling
    if (menuItem?.customizationIds) {
      setSelectedIds(menuItem.customizationIds);
    } else {
      setSelectedIds([]);
    }
    setShowAddForm(false);
    setNewName('');
    setNewPrice('');
    onOpenChange(false);
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
        setSelectedIds(newIds);
        setNewName('');
        setNewPrice('');
        setShowAddForm(false);
        toast({ title: 'Added', description: 'Customization created. Click "Save Changes" to link it.' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">Manage Customizations</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {menuItem?.name} – Select applicable customizations for this menu item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Add New */}
          {!showAddForm ? (
            <Button 
              variant="outline" 
              className="w-full h-10 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all" 
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Customization
            </Button>
          ) : (
            <div className="p-5 border-2 rounded-xl space-y-3 bg-gradient-to-br from-muted/50 to-muted/30 animate-in slide-in-from-top-2 duration-200">
              <h4 className="font-semibold text-sm">New Customization</h4>
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10"
                autoFocus
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-10"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddNew} disabled={createMutation.isPending} className="h-9 flex-1">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewPrice('');
                }} className="h-9">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {allCustomizations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <p className="text-sm text-muted-foreground">No customizations available. Create one above!</p>
              </div>
            ) : (
              allCustomizations.map((cust, index) => {
                const isSelected = selectedIds.includes(cust.customizationId);
                return (
                  <div
                    key={cust.customizationId}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-xl transition-all duration-200",
                      "hover:shadow-md hover:border-primary/30 cursor-pointer",
                      isSelected && "bg-primary/5 border-primary/50 shadow-sm",
                      "animate-in fade-in slide-in-from-left-2 duration-300"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => handleToggle(cust.customizationId, !isSelected)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggle(cust.customizationId, checked as boolean)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "font-medium text-sm",
                            isSelected && "text-primary font-semibold"
                          )}>
                            {cust.name}
                          </span>
                          {cust.price > 0 && (
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs font-mono">
                              +{cust.price.toLocaleString()} VND
                            </Badge>
                          )}
                          {cust.price === 0 && isSelected && (
                            <Badge variant="outline" className="text-xs">Free</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1 h-9">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-9"
              disabled={updateMenuItemMutation.isPending}
            >
              {updateMenuItemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

