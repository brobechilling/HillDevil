import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Eye } from 'lucide-react';
import { OrderBillDialog } from '@/components/OrderBillDialog';

const BillingPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { orders, markOrderAsBilled } = useOrderStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const unbilledOrders = orders.filter(
    o => o.branchId === branchId && o.status === 'completed' && !o.billed
  );

  const billedOrders = orders.filter(
    o => o.branchId === branchId && o.billed
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Billing Management</h2>
      </div>

      <div className="grid gap-6">
        {/* Unbilled Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Ready for Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {unbilledOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders ready for payment
              </p>
            ) : (
              <div className="space-y-3">
                {unbilledOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Order #{order.id}</span>
                        <Badge variant="default">{order.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Table {order.tableNumber} • {order.guestName} • {order.orderLines.length} line(s)
                      </div>
                      <div className="text-lg font-bold text-primary mt-2">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Bill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billed Orders History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {billedOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payment history yet
              </p>
            ) : (
              <div className="space-y-3">
                {billedOrders.slice(0, 10).map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Order #{order.id}</span>
                        <Badge variant="secondary">
                          <Receipt className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Table {order.tableNumber} • {order.guestName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.billedAt && new Date(order.billedAt).toLocaleString()}
                      </div>
                      <div className="text-lg font-bold mt-2">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedOrderId && (
        <OrderBillDialog
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default BillingPage;
