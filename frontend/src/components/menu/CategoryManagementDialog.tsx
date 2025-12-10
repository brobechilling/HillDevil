import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCustomizations, useCreateCustomization, useCustomizationLimit } from '@/hooks/queries/useCustomizations';
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
  const navigate = useNavigate();
  const { data: allCustomizations = [] } = useCustomizations(restaurantId);
  const { data: category } = useCategory(categoryId);
  const { data: limit } = useCustomizationLimit(restaurantId);
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

  const totalSelected = selectedIds.length;
  // -1 means unlimited (Premium), 0 means no access, >0 means specific limit (Basic)
  const isUnlimited = limit === -1;
  const isOverLimit = limit !== undefined && limit > 0 && totalSelected > limit;
  const isAtLimit = limit !== undefined && limit > 0 && totalSelected >= limit;

  const handleToggle = (custId: string, checked: boolean) => {
    // Nếu đang đạt limit và user cố tick thêm → chặn lại
    if (!checked && selectedIds.includes(custId)) {
      // bỏ chọn => cho phép
      setSelectedIds(selectedIds.filter(id => id !== custId));
    } else if (checked) {
      if (isAtLimit) {
        toast({
          variant: 'destructive',
          title: 'Limit reached',
          description: `You can only select up to ${limit} customizations.`,
        });
        return;
      }
      setSelectedIds([...selectedIds, custId]);
    }
  };

  const handleSave = () => {
    if (!category) return;
    updateCategoryMutation.mutate({
      id: categoryId,
      data: { ...category, customizationIds: selectedIds }
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
    if (category?.customizationIds) {
      setSelectedIds(category.customizationIds);
    } else {
      setSelectedIds([]);
    }
    setShowAddForm(false);
    setNewName('');
    setNewPrice('');
    onOpenChange(false);
  };

  const handleAddNew = () => {
    if (isAtLimit) {
      toast({
        variant: 'destructive',
        title: 'Limit reached',
        description: `You can only create up to ${limit} customizations.`,
      });
      return;
    }

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">Manage Customizations</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {category?.name} – Select applicable customizations for this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Limit warning */}
          {limit !== undefined && limit !== -1 && (
            <>
              <div className="text-sm text-muted-foreground text-center">
                {totalSelected}/{limit} selected
                {isAtLimit && (
                  <span className="text-amber-500 ml-1">(Limit reached)</span>
                )}
              </div>

              {isAtLimit && (
                <Card className="border-amber-500">
                  <CardContent className="pt-6 pb-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-500/20">
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-500 mb-1">Customization Limit Reached</h4>
                      <p className="text-sm text-muted-foreground">
                        You've reached the maximum number of customizations in your current package. 
                        Please upgrade to Premium to add more customizations and unlock additional features.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                      onClick={() => navigate('/profile/subscription')}
                    >
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Add New */}
          {!showAddForm ? (
            <Button 
              variant="outline" 
              className="w-full h-10 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all" 
              onClick={() => setShowAddForm(true)}
              disabled={isAtLimit}
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
                <Button size="sm" onClick={handleAddNew} disabled={createMutation.isPending || isAtLimit} className="h-9 flex-1">
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
                const disabled = !isSelected && isAtLimit; // chặn tick thêm khi đã đủ limit

                return (
                  <div
                    key={cust.customizationId}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg transition-all duration-200",
                      disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:border-primary/30 cursor-pointer",
                      isSelected && "bg-primary/5 border-primary/50 shadow-sm",
                      "animate-in fade-in slide-in-from-left-2 duration-300"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => !disabled && handleToggle(cust.customizationId, !isSelected)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => !disabled && handleToggle(cust.customizationId, checked as boolean)}
                        disabled={disabled}
                        className="pointer-events-none mt-0.5"
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

          {/* Footer */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            {isOverLimit && (
              <p className="text-red-500 text-sm text-center">
                You have selected more than the allowed limit ({limit}).
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1 h-9">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-9"
                disabled={updateCategoryMutation.isPending || isOverLimit}
              >
                {updateCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};