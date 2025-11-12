import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { OrderDTO } from '@/dto/order.dto';
import { Receipt, Mail, Phone, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { BillCreationDialog } from './BillCreationDialog';
import { useReservationsByTable } from '@/hooks/queries/useReservationsByTable';
import { useTable } from '@/hooks/queries/useTables';
// import { usePendingOrderByTable } from '@/hooks/queries/useOrders';

interface TableDetailsDialogProps {
  tableId?: string | null;
  table?: any;
  branchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableDetailsDialog = ({ tableId, table, branchId, open, onOpenChange }: TableDetailsDialogProps) => {
  const tableQuery = useTable(tableId);
  // const pendingOrderQuery = usePendingOrderByTable(tableId ?? '');

  const tableFromApi = tableQuery.data;
  const effectiveTable = table || tableFromApi;

  const reservationsQuery = useReservationsByTable(effectiveTable?.id);

  console.debug('TableDetailsDialog: reservationsQuery=', reservationsQuery);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [reservationIndex, setReservationIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const reservations = reservationsQuery.data as any[] | undefined;
    if (!reservations || reservations.length <= 1) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setReservationIndex(i => (i + 1) % reservations.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [reservationsQuery.data, isPaused]);

  if (!effectiveTable) return null;


  // const allOrders = useMemo(() => {
  //   const o = pendingOrderQuery.data;
  //   return o ? [o as OrderDTO] : [];
  // }, [pendingOrderQuery.data]);

  // const isBilled = (order: OrderDTO) =>
  //   order.orderLines.every(line => ((line as any).orderLineStatus || (line as any).status || '').toString().toLowerCase() === 'completed');

  // const currentOrders = useMemo(() =>
  //   allOrders.filter(o => !isBilled(o) && ['pending', 'preparing', 'ready', 'completed'].includes(o.status)),
  //   [allOrders]
  // );

  // const pastOrders = useMemo(() => allOrders.filter(isBilled), [allOrders]);

  const getStatusBadge = (status: any) => {
    const s = (status || '').toString().toLowerCase();
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      preparing: 'secondary',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[s] || 'default'}>{status}</Badge>;
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="table-details-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {effectiveTable.number || effectiveTable.tag} - Details
              {effectiveTable.reservationStart && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                  Reserved
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {effectiveTable.reservationStart && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 text-sm">Reservation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {effectiveTable.reservationName && (
                    <div>
                      <p className="text-muted-foreground">Guest Name</p>
                      <p className="font-semibold">{effectiveTable.reservationName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-semibold">{new Date(effectiveTable.reservationStart).toLocaleString()}</p>
                  </div>
                  {effectiveTable.reservationEnd && (
                    <div>
                      <p className="text-muted-foreground">End Time</p>
                      <p className="font-semibold">{new Date(effectiveTable.reservationEnd).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Table Capacity</p>
                    <p className="font-semibold">{effectiveTable.capacity} guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned reservations (from public API) */}
          {Array.isArray(reservationsQuery.data) && (reservationsQuery.data as any[]).length > 0 && (
            <Card className="mt-4">
              <CardContent>
                <h4 className="font-semibold mb-3 text-sm">Assigned Reservations</h4>

                {/* Carousel: show one reservation at a time and auto-advance when multiple */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {/** Controls and slide container **/}
                  <div className="p-3 border rounded-md bg-background/50">
                    {/** slide content below **/}
                    {(() => {
                      const reservations = (reservationsQuery.data as any[]) || [];
                      if (reservations.length === 0) return <div className="text-sm text-muted-foreground">No reservations</div>;
                      const current = reservations[reservationIndex % reservations.length];
                      const start = current.startTime || current.reservationStart || current.createdAt;
                      return (
                        <div key={current.reservationId || current.id} className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div className="font-semibold">{current.customerName || current.reservationName || current.customerFullName || 'Guest'}</div>
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span className="font-medium">mail:</span>
                                <span className="truncate">{current.customerEmail || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                <span className="font-medium">phone:</span>
                                <span>{current.customerPhone || '-'}</span>
                              </div>
                              {current.note && (
                                <div className="pt-1 text-xs italic text-muted-foreground">Note: {current.note}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div className="font-medium">{start ? new Date(start).toLocaleString() : '-'}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">start</div>
                            <div className="mt-2">
                              <Badge variant="secondary">{(current.status || '').toString()}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Guests: {current.guestNumber ?? current.guest ?? current.partySize ?? '-'}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/** Nav controls when multiple reservations exist **/}
                  {reservationsQuery.data.length > 1 && (
                    <>
                      <button
                        aria-label="Previous reservation"
                        onClick={() => setReservationIndex(i => Math.max(0, (i - 1 + reservationsQuery.data.length) % reservationsQuery.data.length))}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/70 rounded-full p-2 hover:scale-105 shadow-md"
                        type="button"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        aria-label="Next reservation"
                        onClick={() => setReservationIndex(i => (i + 1) % reservationsQuery.data.length)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/70 rounded-full p-2 hover:scale-105 shadow-md"
                        type="button"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex gap-2 justify-center mt-3">
                        {Array.from({ length: reservationsQuery.data.length }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setReservationIndex(idx)}
                            className={reservationIndex % reservationsQuery.data.length === idx ? 'w-2 h-2 rounded-full bg-primary' : 'w-2 h-2 rounded-full bg-border'}
                            aria-label={`Show reservation ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
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
              {/* {currentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No current orders</p>
              ) : (
                <>
                  {currentOrders.map((order) => (
                    <Card key={(order as any).orderId || (order as any).id} className="border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">Order #{(order as any).orderId || (order as any).id}</h4>
                              {getStatusBadge((order as any).status || (order as any).orderStatus || '')}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-lg">${((order as any).totalPrice ?? 0).toFixed(2)}</p>
                        </div>

                        <div className="space-y-3">
                          {order.orderLines.map((line, lineIdx) => (
                            <div key={(line as any).orderLineId || (line as any).id} className="space-y-2 p-2 bg-muted/30 rounded">
                              <div className="text-xs text-muted-foreground">
                                Line {lineIdx + 1} - {new Date((line as any).createdAt).toLocaleTimeString()}
                              </div>
                              {((line as any).orderItems || (line as any).items || []).map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm flex-col">
                                  <div className="flex justify-between w-full">
                                    <span>{(item.quantity ?? 1)}x {item.name || item.menuItemName || item.menuItemId || 'Item'}</span>
                                    <span className="text-muted-foreground">${((item.totalPrice ?? 0)).toFixed(2)}</span>
                                  </div>
                                  {item.note && (
                                    <span className="text-xs italic text-muted-foreground mt-0.5">
                                      Note: {item.note}
                                    </span>
                                  )}
                                  {item.customizations?.length > 0 && (
                                    <div className="ml-4 mt-1 space-y-1">
                                      {item.customizations.map((cust: any) => (
                                        <div key={cust.id || cust.customizationId} className="flex justify-between text-xs text-muted-foreground">
                                          <span>{cust.quantity ?? 1}x {cust.name || cust.label || cust.customizationName}</span>
                                          <span>${((cust.totalPrice ?? 0)).toFixed(2)}</span>
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
                          setSelectedOrders(completedUnbilledOrders.map(o => (o as any).orderId || (o as any).id));
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
              )} */}
            </TabsContent>

            {/* <TabsContent value="history" className="space-y-4">
              {pastOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No past orders</p>
              ) : (
                pastOrders.map((order) => (
                  <Card key={(order as any).orderId || (order as any).id} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold">Order #{(order as any).orderId || (order as any).id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date((order as any).createdAt).toLocaleString()}
                          </p>
                          {((order as any).updatedAt) && (
                            <p className="text-xs text-muted-foreground">
                              Last Updated: {new Date((order as any).updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-lg">${(((order as any).totalPrice ?? 0)).toFixed(2)}</p>
                      </div>

                      <div className="space-y-3">
                        {(order.orderLines || []).map((line: any, lineIdx: number) => (
                          <div key={(line as any).orderLineId || (line as any).id} className="space-y-2 p-2 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">
                              Line {lineIdx + 1} - {new Date((line as any).createdAt).toLocaleTimeString()}
                            </div>
                            {(((line as any).orderItems || (line as any).items) || []).map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{(item.quantity ?? 1)}x {item.name || item.menuItemName || item.menuItemId || 'Item'}</span>
                                <span className="text-muted-foreground">
                                  ${((item.totalPrice ?? 0)).toFixed(2)}
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
            </TabsContent> */}
          </Tabs>
        </DialogContent>
      </Dialog>

      <BillCreationDialog
        open={billDialogOpen}
        onOpenChange={setBillDialogOpen}
        orderIds={selectedOrders}
        tableNumber={effectiveTable.number}
        onBillCreated={() => {
          setSelectedOrders([]);
          setBillDialogOpen(false);
        }}
      />
    </>
  );
};
