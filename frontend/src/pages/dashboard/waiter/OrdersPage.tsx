import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, Order } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ManualOrderDialog } from '@/components/waiter/ManualOrderDialog';

const OrdersPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';
  const { orders, updateOrderStatus } = useOrderStore();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [addOrderlineDialogOpen, setAddOrderlineDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const branchOrders = orders?.filter(o => o.branchId === branchId) || [];
  const pendingOrders = branchOrders.filter(o => o.status === 'pending');
  const activeOrders = branchOrders.filter(o => ['preparing', 'ready'].includes(o.status));

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
    toast({ title: 'Order accepted', description: 'Order is now being prepared.' });
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    toast({ title: 'Order rejected', description: 'Order has been cancelled.' });
  };

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast({ title: 'Order completed', description: 'Order has been served and ready for billing.' });
  };

  const handleAddOrderline = (orderId: string) => {
    setSelectedOrderId(orderId);
    setAddOrderlineDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      preparing: 'default',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const calculateLineTotal = (line: any) => {
    if (!line.items || line.items.length === 0) return 0;
    return line.items.reduce((sum: number, item: any) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      const customizationTotal = item.customizations?.reduce((cSum: number, c: any) => cSum + (c.price || 0), 0) || 0;
      return sum + itemTotal + customizationTotal;
    }, 0);
  };

  const calculateOrderTotal = (order: Order) => {
    if (!order.orderLines || order.orderLines.length === 0) return 0;
    return order.orderLines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  };

  const renderOrderCard = (order: Order, showActions: boolean = true) => {
    const orderTotal = order.total || calculateOrderTotal(order);

    return (
      <Card key={order.id} className="space-y-3">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Order #{order.id} - Table {order.tableNumber}
            </CardTitle>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {order.orderLines?.map((line, lineIdx) => {
            const lineTotal = line.total || calculateLineTotal(line);
            return (
              <div key={line.id || lineIdx} className="p-3 bg-muted/20 rounded border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Line {lineIdx + 1} - {line.createdAt ? new Date(line.createdAt).toLocaleTimeString() : 'N/A'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    ${lineTotal.toFixed(2)}
                  </Badge>
                </div>

                {line.items?.map((item, idx) => (
                  <div key={idx} className="ml-2 space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{item.quantity || 0}x {item.name || 'Unknown Item'}</span>
                      <span>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</span>
                    </div>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="ml-4 text-xs text-muted-foreground space-y-0.5">
                        {item.customizations.map((custom, cIdx) => (
                          <div key={cIdx} className="flex justify-between">
                            <span>+ {custom.optionName || custom.customizationName || 'Customization'}</span>
                            <span>+${(custom.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {line.notes && (
                  <div className="text-xs text-muted-foreground italic border-t pt-1 mt-1">
                    Note: {line.notes}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 border-t flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>

          {showActions && (
            <div className="flex flex-wrap gap-2 pt-2">
              {order.status === 'pending' && (
                <>
                  <Button className="flex-1" onClick={() => handleAcceptOrder(order.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleRejectOrder(order.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {(order.status === 'preparing' || order.status === 'ready') && (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => handleAddOrderline(order.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Orderline
                  </Button>
                  <Button className="flex-1" onClick={() => handleComplete(order.id)}>
                    Complete
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <Button onClick={() => setOrderDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingOrders.map(order => renderOrderCard(order, true))}
          {pendingOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeOrders.map(order => renderOrderCard(order, true))}
          {activeOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active orders
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ManualOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        branchId={branchId}
      />

      {selectedOrderId && (
        <ManualOrderDialog
          open={addOrderlineDialogOpen}
          onOpenChange={setAddOrderlineDialogOpen}
          branchId={branchId}
        />
      )}
    </div>
  );
};

export default OrdersPage;
