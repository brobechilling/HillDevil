import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Receipt, Percent, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BillingPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId;
  const { orders, updateOrderStatus } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  const completedOrders = orders.filter(
    o => o.branchId === branchId && o.status === 'completed' && !o.billed
  );

  const selectedOrderData = orders.find(o => o.id === selectedOrder);
  const subtotal = selectedOrderData?.total || 0;
  const discountAmount = (subtotal * parseFloat(discount || '0')) / 100;
  const total = subtotal - discountAmount;

  const handleGenerateBill = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder) return;

    const { markOrderAsBilled } = useOrderStore.getState();
    markOrderAsBilled(selectedOrder);

    toast({
      title: 'Payment confirmed',
      description: `Bill for order #${selectedOrder} has been paid.`,
    });

    setSelectedOrder(null);
    setDiscount('0');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Billing & Payment</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Orders Ready for Billing</h3>
          {completedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order #{order.id} - Table {order.tableNumber}
                  </CardTitle>
                  <Badge>Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.orderLines.map((line, lineIdx) => (
                    <div key={line.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(line.createdAt).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="ml-auto">
                          Line {lineIdx + 1}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {line.items.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="pl-4 text-xs text-muted-foreground">
                                {item.customizations.map((custom, cIdx) => (
                                  <div key={cIdx}>
                                    + {custom.optionName}
                                    {custom.price > 0 && ` (+$${custom.price.toFixed(2)})`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {line.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {line.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateBill(order.id)}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Generate Bill
                </Button>
              </CardContent>
            </Card>
          ))}
          {completedOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No orders ready for billing
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bill Details</h3>
          {selectedOrderData ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Order #{selectedOrderData.id} - Table {selectedOrderData.tableNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedOrderData.orderLines.map((line, lineIdx) => (
                    <div key={line.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(line.createdAt).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="ml-auto">
                          Line {lineIdx + 1}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {line.items.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="pl-4 text-xs text-muted-foreground">
                                {item.customizations.map((custom, cIdx) => (
                                  <div key={cIdx}>
                                    + {custom.optionName}
                                    {custom.price > 0 && ` (+$${custom.price.toFixed(2)})`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Percent className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {parseFloat(discount) > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPaymentMethod('cash')}
                    >
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPaymentMethod('card')}
                    >
                      Card
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Select an order to generate bill
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
