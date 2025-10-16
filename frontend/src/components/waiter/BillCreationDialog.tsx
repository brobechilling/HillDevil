import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/store/orderStore';
import { toast } from '@/hooks/use-toast';

interface BillCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderIds: string[];
  tableNumber: number;
  onBillCreated: () => void;
}

export const BillCreationDialog = ({ 
  open, 
  onOpenChange, 
  orderIds, 
  tableNumber,
  onBillCreated 
}: BillCreationDialogProps) => {
  const orders = useOrderStore((state) => state.orders);
  const markOrderAsBilled = useOrderStore((state) => state.markOrderAsBilled);

  const selectedOrders = orders.filter(o => orderIds.includes(o.id));
  const totalAmount = selectedOrders.reduce((sum, order) => sum + order.total, 0);

  const allItems = selectedOrders.flatMap(order => 
    order.orderLines.flatMap(line =>
      line.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }))
    )
  );

  const handleCreateBill = () => {
    orderIds.forEach(orderId => {
      markOrderAsBilled(orderId);
    });

    toast({
      title: 'Bill Created',
      description: `Bill for Table ${tableNumber} has been generated successfully.`,
    });

    onBillCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Bill - Table {tableNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Order Summary</h4>
            {allItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateBill} className="flex-1">
              Confirm & Create Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
