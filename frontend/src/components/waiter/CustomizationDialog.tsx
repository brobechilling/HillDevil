import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MenuItem } from '@/store/menuStore';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';

interface CustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainItem: MenuItem;
  customizationItems: MenuItem[];
  onConfirm: (selections: Map<string, { quantity: number; item: MenuItem }>) => void;
}

export const CustomizationDialog = ({
  open,
  onOpenChange,
  mainItem,
  customizationItems,
  onConfirm,
}: CustomizationDialogProps) => {
  const [selections, setSelections] = useState<Map<string, { quantity: number; item: MenuItem }>>(
    new Map()
  );

  // Group customizations by category
  const groupedCustomizations = customizationItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleQuantityChange = (itemId: string, item: MenuItem, delta: number) => {
    const current = selections.get(itemId);
    const currentQty = current?.quantity || 0;
    const newQty = Math.max(0, Math.min(3, currentQty + delta));

    if (newQty === 0) {
      const newSelections = new Map(selections);
      newSelections.delete(itemId);
      setSelections(newSelections);
    } else {
      setSelections(new Map(selections.set(itemId, { quantity: newQty, item })));
    }
  };

  const handleConfirm = () => {
    onConfirm(selections);
    setSelections(new Map());
    onOpenChange(false);
  };

  const getTotalPrice = () => {
    let total = mainItem.price;
    selections.forEach(({ quantity, item }) => {
      total += item.price * quantity;
    });
    return total;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize: {mainItem.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{mainItem.name}</h3>
                <p className="text-sm text-muted-foreground">{mainItem.description}</p>
              </div>
              <Badge variant="outline">${mainItem.price.toFixed(2)}</Badge>
            </div>
          </div>

          {Object.entries(groupedCustomizations).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-semibold text-primary">{category}</h4>
              <div className="space-y-2">
                {items.map((item) => {
                  const selection = selections.get(item.id);
                  const quantity = selection?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.price > 0 && (
                            <Badge variant="secondary">+${item.price.toFixed(2)}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item, -1)}
                          disabled={quantity === 0}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="text"
                          value={quantity}
                          readOnly
                          className="w-12 text-center h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item, 1)}
                          disabled={quantity >= 3}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${getTotalPrice().toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Add to Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
