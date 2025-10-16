import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OrderItem, useOrderStore } from '@/store/orderStore';
import { toast } from '@/hooks/use-toast';

interface OrderBillDialogProps {
  orderId?: string;
  trigger?: React.ReactNode;
  items?: OrderItem[];
  total?: number;
  onClose?: () => void;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OrderBillDialog({ 
  orderId, 
  trigger, 
  items: providedItems, 
  total: providedTotal, 
  onClose, 
  title,
  open: controlledOpen,
  onOpenChange 
}: OrderBillDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { orders, markOrderAsBilled } = useOrderStore();
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  let order;
  let items = providedItems;
  let total = providedTotal;
  
  if (orderId) {
    order = orders.find(o => o.id === orderId);
    if (order) {
      items = order.orderLines.flatMap(line => line.items);
      total = order.total;
    }
  }

  const handleMarkAsPaid = () => {
    if (orderId) {
      markOrderAsBilled(orderId);
      toast({
        title: 'Payment Confirmed',
        description: 'Order has been marked as paid.',
      });
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const content = (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title || 'Order Bill'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-2 mt-2">
        {items?.map((item, idx) => (
          <div key={`${item.menuItemId}-${idx}`} className="flex justify-between text-sm">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total</span>
          <span className="text-primary">${total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {orderId && order && !order.billed && (
          <Button className="flex-1" onClick={handleMarkAsPaid}>
            Mark as Paid
          </Button>
        )}
        <Button 
          variant={orderId && order && !order.billed ? 'outline' : 'default'} 
          className={orderId && order && !order.billed ? 'flex-1' : 'w-full'} 
          onClick={handleClose}
        >
          Close
        </Button>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {content}
    </Dialog>
  );
}
