import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderStore, Order } from '@/store/orderStore';
import { Receipt } from 'lucide-react';
import { BillCreationDialog } from './BillCreationDialog';

interface TableDetailsDialogProps {
  tableId: string | null;
  branchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableDetailsDialog = ({ tableId, branchId, open, onOpenChange }: TableDetailsDialogProps) => {
  // const getTableById = useTableStore((state) => state.getTableById);
  const getOrdersByTable = useOrderStore((state) => state.getOrdersByTable);
  
  // Cache table để tránh render vô hạn
  // const table = useMemo(() => tableId ? getTableById(tableId) : undefined, [tableId, getTableById]);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [billDialogOpen, setBillDialogOpen] = useState(false);

  // if (!table) return null;

  // const allOrders = useMemo(() => getOrdersByTable(table.id), [table.id, getOrdersByTable]);

  const isBilled = (order: Order) =>
    order.orderLines.every(line => line.orderLineStatus === 'completed');

  // const currentOrders = useMemo(() => 
  //   allOrders.filter(o => !isBilled(o) && ['pending', 'preparing', 'ready', 'completed'].includes(o.status)),
  //   [allOrders]
  // );

  // const pastOrders = useMemo(() => allOrders.filter(isBilled), [allOrders]);

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      preparing: 'secondary',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // const completedUnbilledOrders = useMemo(
  //   () => currentOrders.filter(o => o.status === 'completed'),
  //   [currentOrders]
  // );

  return (
    <>
      {/* <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="table-details-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Table {table.number} - Details
              {table.reservationStart && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                  Reserved
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {table.reservationStart && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 text-sm">Reservation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {table.reservationName && (
                    <div>
                      <p className="text-muted-foreground">Guest Name</p>
                      <p className="font-semibold">{table.reservationName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-semibold">{new Date(table.reservationStart).toLocaleString()}</p>
                  </div>
                  {table.reservationEnd && (
                    <div>
                      <p className="text-muted-foreground">End Time</p>
                      <p className="font-semibold">{new Date(table.reservationEnd).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Table Capacity</p>
                    <p className="font-semibold">{table.capacity} guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Orders</TabsTrigger>
              <TabsTrigger value="history">Past Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {currentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No current orders</p>
              ) : (
                <>
                  {currentOrders.map((order) => (
                    <Card key={order.id} className="border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">Order #{order.id}</h4>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                        </div>

                        <div className="space-y-3">
                          {order.orderLines.map((line, lineIdx) => (
                            <div key={line.id} className="space-y-2 p-2 bg-muted/30 rounded">
                              <div className="text-xs text-muted-foreground">
                                Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
                              </div>
                              {line.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm flex-col">
                                  <div className="flex justify-between w-full">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="text-muted-foreground">${item.totalPrice.toFixed(2)}</span>
                                  </div>
                                  {item.note && (
                                    <span className="text-xs italic text-muted-foreground mt-0.5">
                                      Note: {item.note}
                                    </span>
                                  )}
                                  {item.customizations?.length > 0 && (
                                    <div className="ml-4 mt-1 space-y-1">
                                      {item.customizations.map((cust) => (
                                        <div key={cust.id} className="flex justify-between text-xs text-muted-foreground">
                                          <span>{cust.quantity}x {cust.name}</span>
                                          <span>${cust.totalPrice.toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {completedUnbilledOrders.length > 0 && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => {
                          setSelectedOrders(completedUnbilledOrders.map(o => o.id));
                          setBillDialogOpen(true);
                        }}
                        className="w-full"
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Create Bill for Completed Orders
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {pastOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No past orders</p>
              ) : (
                pastOrders.map((order) => (
                  <Card key={order.id} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold">Order #{order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          {order.updatedAt && (
                            <p className="text-xs text-muted-foreground">
                              Last Updated: {new Date(order.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                      </div>

                      <div className="space-y-3">
                        {order.orderLines.map((line, lineIdx) => (
                          <div key={line.id} className="space-y-2 p-2 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">
                              Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
                            </div>
                            {line.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="text-muted-foreground">
                                  ${item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BillCreationDialog
        open={billDialogOpen}
        onOpenChange={setBillDialogOpen}
        orderIds={selectedOrders}
        tableNumber={table.number}
        onBillCreated={() => {
          setSelectedOrders([]);
          setBillDialogOpen(false);
        }}
      /> */}
    </>
  );
};
