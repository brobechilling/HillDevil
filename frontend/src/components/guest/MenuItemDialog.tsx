import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCustomizationsOfMenuItems } from '@/hooks/queries/useMenuItems';
import { GuestBranchMenuItemDTO } from '@/dto/branchMenuItem.dto';
import { Loader2, Plus, Minus, Check } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CreateOrderItemRequest } from '@/dto/orderItem.dto';
import { CreateOrderItemCustomizationRequest } from '@/dto/orderItemCustomization.dto';

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: GuestBranchMenuItemDTO;
  onAddItem: (item: CreateOrderItemRequest) => void;
}

const MenuItemDialog = ({ open, onOpenChange, menuItem, onAddItem }: MenuItemDialogProps) => {
  const { data: customizations, isLoading } = useCustomizationsOfMenuItems(menuItem.menuItemId);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustoms, setSelectedCustoms] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const toggleCustomization = (id: string, price: number) => {
    setSelectedCustoms((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };

  const updateCustomizationQty = (id: string, delta: number) => {
    setSelectedCustoms((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const computeTotal = () => {
    let base = menuItem.price * quantity;
    if (customizations) {
      for (const c of customizations) {
        if (selectedCustoms[c.customizationId]) {
          base += c.price * selectedCustoms[c.customizationId];
        }
      }
    }
    return base;
  };

  const handleAdd = () => {
    const item: CreateOrderItemRequest = {
      menuItemId: menuItem.menuItemId,
      quantity,
      totalPrice: computeTotal(),
      note,
      customizations: Object.entries(selectedCustoms).map(([id, qty]) => {
        const c = customizations?.find((cc) => cc.customizationId === id)!;
        const customizationReq: CreateOrderItemCustomizationRequest = {
          customizationId: id,
          quantity: qty,
          totalPrice: c.price * qty,
        };
        return customizationReq;
      }),
    };
    onAddItem(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{menuItem.name}</DialogTitle>
          <DialogDescription>{menuItem.description}</DialogDescription>
        </DialogHeader>

        {menuItem.imageUrl && (
          <img
            src={menuItem.imageUrl}
            alt={menuItem.name}
            className="rounded-lg w-full h-60 object-cover"
          />
        )}

        <Separator className="my-3" />

        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Customizations</h4>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : customizations && customizations.length > 0 ? (
            <ul className="space-y-2">
              {customizations.map((c) => {
                const selected = selectedCustoms[c.customizationId];
                return (
                  <li
                    key={c.customizationId}
                    className={`flex justify-between items-center border p-2 rounded-lg cursor-pointer ${
                      selected ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => toggleCustomization(c.customizationId, c.price)}
                  >
                    <div className="flex items-center gap-2">
                      {selected && <Check className="w-4 h-4 text-primary" />}
                      <span>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCustomizationQty(c.customizationId, -1);
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span>{selected}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCustomizationQty(c.customizationId, 1);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      <span className="font-medium text-primary">+{c.price} VND</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No customization available.</p>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <Button size="icon" variant="outline" onClick={() => setQuantity((q) => q + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xl font-bold">{computeTotal().toFixed(2)} VND</div>
        </div>

        <Input
          placeholder="Add note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-3"
        />

        <DialogFooter>
          <Button className="w-full mt-3" onClick={handleAdd}>
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDialog;
