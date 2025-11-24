import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCustomizationsOfMenuItems } from "@/hooks/queries/useMenuItems";
import { useDeleteOrderItem, useUpdateOrderItem } from "@/hooks/queries/useOrderItems";
import { OrderItemDTO } from "@/dto/orderItem.dto";
import { OrderItemCustomizationDTO } from "@/dto/orderItemCustomization.dto";
import { OrderLineStatus } from "@/dto/orderLine.dto";

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

interface OrderLineEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderItem: OrderItemDTO;
    branchId: string;
    activeTab: string;
}

export const OrderLineEditDialog = ({
  open,
  onOpenChange,
  orderItem,
  branchId,
  activeTab,
}: OrderLineEditDialogProps) => {
  const updateOrderItemMutation = useUpdateOrderItem(branchId, activeTab as OrderLineStatus);
  const deleteOrderItemMutation = useDeleteOrderItem(branchId, activeTab as OrderLineStatus);

  // Local editable copy
  const [edited, setEdited] = useState<OrderItemDTO | null>(() =>
    orderItem ? JSON.parse(JSON.stringify(orderItem)) : null
  );

  // Reload when orderItem prop changes (open again for different item)
  useEffect(() => {
    if (orderItem) setEdited(JSON.parse(JSON.stringify(orderItem)));
  }, [orderItem]);

  // compute existing customizations total
  const customTotal = useMemo(() => {
    if (!edited) return 0;
    return sum(
      edited.customizations.map((c) => (c.quantity > 0 ? c.totalPrice : 0))
    );
  }, [edited]);

  const basePrice = useMemo(() => {
    if (!edited) return 0;
    const q = edited.quantity || 1;
    const base = (edited.totalPrice - sum(edited.customizations.map((c) => c.totalPrice))) / q;
    // if NaN or infinite, fallback
    return Number.isFinite(base) ? base : 0;
  }, [edited]);

  // recompute order total when quantities change
  const recomputeTotal = (draft: OrderItemDTO) => {
    const q = draft.quantity || 1;
    const customSum = sum(draft.customizations.map((c) => (c.quantity > 0 ? c.totalPrice : 0)));
    draft.totalPrice = basePrice * q + customSum;
    return draft;
  };

  // change orderItem quantity
  const changeQuantity = (delta: number) => {
    if (!edited) return;
    const draft = { ...edited } as OrderItemDTO;
    draft.quantity = Math.max(1, (draft.quantity || 1) + delta);

    recomputeTotal(draft);
    setEdited(draft);
  };

  // change customization qty
  const changeCustomizationQty = (custId: string, delta: number) => {
    if (!edited) return;
    const draft = { ...edited } as OrderItemDTO;
    draft.customizations = draft.customizations.map((c) => {
      if (c.orderItemCustomizationId === custId) {
        const newQty = Math.max(0, c.quantity + delta);
        // if we know per-unit price, derive it
        const unitPrice = c.quantity > 0 ? c.totalPrice / c.quantity : c.totalPrice; // fallback
        const newTotal = Number((unitPrice * newQty).toFixed(2));
        return { ...c, quantity: newQty, totalPrice: newTotal };
      }
      return c;
    });

    recomputeTotal(draft);
    setEdited(draft);
  };

  // remove customization -> set quantity = 0
  const removeCustomization = (custId: string) => {
    if (!edited) return;
    const draft = { ...edited } as OrderItemDTO;
    draft.customizations = draft.customizations.map((c) =>
      c.orderItemCustomizationId === custId ? { ...c, quantity: 0, totalPrice: 0 } : c
    );
    recomputeTotal(draft);
    setEdited(draft);
  };

  // add customization from menu's available list
  const [showAdd, setShowAdd] = useState(false);
  const { data: availableCustomizations, isLoading: isLoadingCustoms } = useCustomizationsOfMenuItems(
    orderItem.menuItemId,
    showAdd
  );

  const addCustomization = (c: { customizationId: string; name: string; price: number }) => {
    if (!edited) return;
    const draft = { ...edited } as OrderItemDTO;

    // try to find existing by customizationId or by name
    const existing = draft.customizations.find(
      (x) => x.customizationId === c.customizationId || x.customizationName === c.name
    );

    if (existing) {
      // if existing had quantity 0 -> revive
      const newQty = existing.quantity + 1 || 1;
      existing.quantity = newQty;
      existing.totalPrice = Number((newQty * c.price).toFixed(2));
    } else {
      // create new object
      const newCust: OrderItemCustomizationDTO = {
        orderItemCustomizationId: crypto.randomUUID(),
        customizationName: c.name,
        quantity: 1,
        totalPrice: Number(c.price.toFixed ? c.price.toFixed(2) : c.price),
        customizationId: c.customizationId,
      };
      draft.customizations = [...draft.customizations, newCust];
    }

    recomputeTotal(draft);
    setEdited(draft);
    // setShowAdd(false);
  };

  const handleSave = async () => {
    if (!edited) return;
    await updateOrderItemMutation.mutateAsync(edited);
    onOpenChange(false);
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteOrderItemMutation.mutate(orderItem?.orderItemId);
    onOpenChange(false);
  }

  if (!edited) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>
            Edit order item: {edited.menuItemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="font-medium">Quantity</div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => changeQuantity(-1)}>-</Button>
              <div className="px-3">{edited.quantity}</div>
              <Button size="sm" onClick={() => changeQuantity(1)}>+</Button>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">Customizations</div>

            <div className="space-y-2">
              {edited.customizations.filter((c) => c.quantity > 0).map((c) => (
                <div key={c.orderItemCustomizationId} className="flex justify-between items-center p-2 bg-muted/10 rounded">
                  <div>
                    <div className="font-medium">{c.customizationName}</div>
                    <div className="text-xs text-muted-foreground">{c.quantity} × { (c.quantity>0 ? (c.totalPrice / c.quantity).toLocaleString() : '0') } VND</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => changeCustomizationQty(c.orderItemCustomizationId, -1)}>-</Button>
                    <div className="w-6 text-center">{c.quantity}</div>
                    <Button size="sm" onClick={() => changeCustomizationQty(c.orderItemCustomizationId, 1)}>+</Button>
                    <div className="w-24 text-right font-medium">{c.totalPrice.toLocaleString()} VND</div>
                    <Button variant="destructive" size="sm" onClick={() => removeCustomization(c.orderItemCustomizationId)}>Remove</Button>
                  </div>
                </div>
              ))}

              {/* If no visible customizations */}
              {edited.customizations.filter((c) => c.quantity > 0).length === 0 && (
                <div className="text-sm text-muted-foreground">No customizations</div>
              )}
            </div>

            <div className="pt-3">
              <Button onClick={() => setShowAdd(true)}>Add customization</Button>
            </div>

            {/* Add picker */}
            {showAdd && (
              <div className="mt-3 p-3 border rounded bg-background">
                {isLoadingCustoms && <div>Loading...</div>}
                {!isLoadingCustoms && availableCustomizations && (
                  <div className="grid grid-cols-1 gap-2">
                    {availableCustomizations.map((c) => (
                      <div key={c.customizationId} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.price.toFixed(2)} VND</div>
                        </div>
                        <div>
                          <Button size="sm" onClick={() => addCustomization({ customizationId: c.customizationId, name: c.name, price: c.price })}>Add</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Button  onClick={() => setShowAdd(false)}>Close</Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-2 flex justify-between font-semibold">
            <div>Base price</div>
            <div>{basePrice.toFixed(2)} VND</div>
          </div>

          <div className="flex justify-between font-semibold">
            <div>Item total</div>
            <div>{edited.totalPrice.toLocaleString()} VND</div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            {/* <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button> */}
            <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)}>Remove</Button>
            <Button onClick={handleSave} disabled={updateOrderItemMutation.isPending}>
              {updateOrderItemMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <p className="text-sm">
            Are you sure you want to remove this order item?
          </p>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDeleteOpen(false);
                handleDelete();
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Dialog>
    
  );
};
