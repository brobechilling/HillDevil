import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrderStore } from '@/store/orderStore';
import { toast } from '@/hooks/use-toast';

interface OrderNotificationProps {
  branchId?: string;
}

export function OrderNotification({ branchId }: OrderNotificationProps) {
  const [open, setOpen] = useState(false);
  const { orders, updateOrderStatus, getPendingOrders } = useOrderStore();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    const pending = getPendingOrders(branchId);
    setPendingOrders(pending);
    // Listen for new order notifications (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'order_notification') {
        const newOrder = e.newValue ? JSON.parse(e.newValue) : null;
        if (newOrder && (!branchId || newOrder.branchId === branchId)) {
          setPendingOrders(getPendingOrders(branchId));
          toast({
            title: 'New Order Received',
            description: `Order from ${newOrder.guestName} for ${newOrder.items.length} item(s)`,
          });
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [orders, branchId, getPendingOrders, toast]);

  const handleStatusUpdate = (orderId: string, status: 'preparing' | 'ready' | 'completed') => {
    updateOrderStatus(orderId, status as any);
    const statusText = status === 'preparing' ? 'Preparing' : status === 'ready' ? 'Ready' : 'Completed';
    toast({
      title: 'Order Updated',
      description: `Order marked as ${statusText}`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingOrders.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {pendingOrders.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Orders</SheetTitle>
          <SheetDescription>
            {pendingOrders.length} pending order{pendingOrders.length !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-4 pr-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending orders
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.guestName}</CardTitle>
                        <CardDescription>
                          {order.guestPhone}
                          {order.tableNumber && ` • Table ${order.tableNumber}`}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <ul className="space-y-1">
                        {order.items.map((item: any, idx: number) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-muted-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Special Instructions:</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
