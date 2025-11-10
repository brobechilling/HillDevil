import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMenuStore, MenuItem } from '@/store/menuStore';
import { useOrderStore, OrderItem } from '@/store/orderStore';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CustomizationDialog } from './CustomizationDialog';

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
}

interface OrderLineItem {
  menuItemId: string;
  quantity: number;
  customizationItems: Array<{ item: MenuItem; quantity: number }>;
}

export const ManualOrderDialog = ({ open, onOpenChange, branchId }: ManualOrderDialogProps) => {
  // const allTables = useTableStore((state) => state.tables);
  // const tables = allTables.filter(t => t.branchId === branchId);
  const allMenuItems = useMenuStore((state) => state.items);
  const menuItems = allMenuItems.filter(item => item.branchId === branchId && item.available);
  const { addOrder, addOrderLine, getActiveOrderByTable } = useOrderStore();

  const [selectedTable, setSelectedTable] = useState('');
  const [orderLines, setOrderLines] = useState<OrderLineItem[]>([{ 
    menuItemId: '', 
    quantity: 1,
    customizationItems: []
  }]);
  const [notes, setNotes] = useState('');
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  const handleAddOrderLine = () => {
    setOrderLines([...orderLines, { 
      menuItemId: '', 
      quantity: 1,
      customizationItems: []
    }]);
  };

  const handleRemoveOrderLine = (index: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== index));
  };

  const handleOrderLineChange = (index: number, field: keyof OrderLineItem, value: string | number) => {
    const updated = [...orderLines];
    if (field === 'menuItemId') {
      const selectedItem = menuItems.find(m => m.id === value);
      updated[index] = { 
        ...updated[index], 
        menuItemId: value as string,
        customizationItems: []
      };
      
      // Check if this item has customizations available
      if (selectedItem && !selectedItem.isCustomizationCategory) {
        const embedded = (selectedItem.customizations && selectedItem.customizations.length > 0);
        const hasCategoryItems = menuItems.some(
          m => m.isCustomizationCategory && m.parentCategory === selectedItem.category && m.available
        );
        if (embedded || hasCategoryItems) {
          setSelectedLineIndex(index);
          setCustomizationDialogOpen(true);
        }
      }
    } else if (field === 'quantity') {
      updated[index] = { ...updated[index], quantity: value as number };
    }
    setOrderLines(updated);
  };

  const handleCustomizationConfirm = (selections: Map<string, { quantity: number; item: MenuItem }>) => {
    if (selectedLineIndex === null) return;
    
    const updated = [...orderLines];
    updated[selectedLineIndex].customizationItems = Array.from(selections.values()).map(
      ({ quantity, item }) => ({ item, quantity })
    );
    setOrderLines(updated);
    setSelectedLineIndex(null);
  };

  const calculateLineTotal = (line: OrderLineItem): number => {
    const menuItem = menuItems.find(m => m.id === line.menuItemId);
    if (!menuItem) return 0;
    
    let itemPrice = menuItem.price;
    line.customizationItems.forEach(({ item, quantity }) => {
      itemPrice += item.price * quantity;
    });
    
    return itemPrice * line.quantity;
  };

  const calculateTotal = (): number => {
    return orderLines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  };

  const handleSubmit = () => {
    if (!selectedTable) {
      toast({
        title: 'Error',
        description: 'Please select a table',
        variant: 'destructive',
      });
      return;
    }

    const validOrderLines = orderLines.filter(line => line.menuItemId && line.quantity > 0);
    if (validOrderLines.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one menu item',
        variant: 'destructive',
      });
      return;
    }

    const items: OrderItem[] = [];
    
    validOrderLines.forEach(line => {
      const menuItem = menuItems.find(m => m.id === line.menuItemId)!;
      
      // Add main item
      items.push({
        id: `item_${Date.now()}_${Math.random()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: line.quantity,
        totalPrice: menuItem.price * line.quantity,
        price: menuItem.price,
      });

      // Add customization items
      line.customizationItems.forEach(({ item, quantity }) => {
        items.push({
          id: `item_${Date.now()}_${Math.random()}`,
          menuItemId: item.id,
          name: `  + ${item.name}`,
          quantity: quantity,
          totalPrice: item.price * quantity,
          price: item.price,
        });
      });
    });

    const lineTotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    // Check if there's an active order for this table
    const existingOrder = getActiveOrderByTable?.(selectedTable);

    if (existingOrder) {
      // Add as a new order line to the existing order
      addOrderLine(existingOrder.id, {
        orderLineStatus: 'pending',
        items,
        total: lineTotal,
        notes,
      });

      toast({
        title: 'Order Line Added',
        description: `New items added to Table ${selectedTable}'s order`,
      });
    } else {
      // Create a new order with the first order line
      addOrder({
        areaTableId: selectedTable,
        tableNumber: typeof selectedTable === 'string' ? parseInt(selectedTable) : selectedTable,
        status: 'pending',
        orderLines: [{
          id: '', // Will be generated
          orderLineStatus: 'pending',
          items,
          total: lineTotal,
          createdAt: '', // Will be generated
          notes,
        }],
      });

      toast({
        title: 'Order Created',
        description: `New order created for Table ${selectedTable}`,
      });
    }

    // Reset form
    setSelectedTable('');
    setOrderLines([{ menuItemId: '', quantity: 1, customizationItems: [] }]);
    setNotes('');
    onOpenChange(false);
  };

  const selectedLineItem = selectedLineIndex !== null && orderLines[selectedLineIndex]
    ? menuItems.find(m => m.id === orderLines[selectedLineIndex].menuItemId)
    : null;

  const availableCustomizations = selectedLineItem && !selectedLineItem.isCustomizationCategory
    ? (() => {
        // Prefer embedded customizations if present
        if (selectedLineItem.customizations && selectedLineItem.customizations.length > 0) {
          return selectedLineItem.customizations.map((c) => ({
            id: c.id,
            branchId: selectedLineItem.branchId,
            name: c.name,
            description: '',
            price: c.price || 0,
            category: 'Add-ons',
            imageUrl: '',
            available: true,
            createdAt: new Date().toISOString(),
            isCustomizationCategory: true,
          } as MenuItem));
        }
        // Fallback to separate customization items by category
        return menuItems.filter(
          m => m.isCustomizationCategory && m.parentCategory === selectedLineItem.category && m.available
        );
      })()
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order / Add Order Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Table *</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {/* {tables.map(table => (
                  <SelectItem key={table.id} value={table.number.toString()}>
                    Table {table.number} (Capacity: {table.capacity})
                  </SelectItem>
                ))} */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button size="sm" variant="outline" onClick={handleAddOrderLine}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {orderLines.map((line, index) => {
                const menuItem = menuItems.find(m => m.id === line.menuItemId);
                const lineTotal = calculateLineTotal(line);

                return (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Select
                          value={line.menuItemId}
                          onValueChange={(value) => handleOrderLineChange(index, 'menuItemId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select menu item" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.filter(item => !item.isCustomizationCategory).map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - ${item.price.toFixed(2)}
                                {item.category && <Badge variant="outline" className="ml-2">{item.category}</Badge>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24 space-y-2">
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleOrderLineChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                        />
                      </div>

                      {orderLines.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveOrderLine(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {menuItem && line.customizationItems.length > 0 && (
                      <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                        <p className="text-sm font-semibold text-muted-foreground">Customizations:</p>
                        <div className="space-y-1">
                          {line.customizationItems.map(({ item, quantity }, idx) => (
                            <div key={idx} className="text-sm flex justify-between">
                              <span>{quantity}x {item.name}</span>
                              <span>${(item.price * quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLineIndex(index);
                            setCustomizationDialogOpen(true);
                          }}
                        >
                          Edit Customizations
                        </Button>
                      </div>
                    )}

                    {menuItem && (
                      <div className="flex justify-end pt-2 border-t">
                        <span className="text-sm font-semibold">
                          Line Total: ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {selectedLineItem && (
        <CustomizationDialog
          open={customizationDialogOpen}
          onOpenChange={setCustomizationDialogOpen}
          mainItem={selectedLineItem}
          customizationItems={availableCustomizations}
          onConfirm={handleCustomizationConfirm}
        />
      )}
    </Dialog>
  );
};
