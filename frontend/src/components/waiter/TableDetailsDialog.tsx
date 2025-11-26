import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { OrderDTO } from '@/dto/order.dto';
import { Receipt, Mail, Phone, Clock, Users, ChevronLeft, ChevronRight, MapPin, AlertCircle } from 'lucide-react';
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-2xl">
          {/* Header with Table Info */}
          <div className="bg-primary text-white p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{effectiveTable.number || effectiveTable.tag}</h2>
                  <p className="text-orange-100 text-sm">{effectiveTable.areaName || 'Table Area'}</p>
                </div>
              </div>
              {effectiveTable.reservationStart && (
                <Badge className="bg-accent hover:bg-accent/90 text-white px-3 py-1 text-xs font-semibold">
                  🔖 Reserved
                </Badge>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-100" />
                <span className="text-sm">{effectiveTable.capacity} seats</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs">
                  {effectiveTable.status || 'Available'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Reserved Table Info */}
            {effectiveTable.reservationStart && (
              <Card className="border border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-4">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Current Reservation</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                    {effectiveTable.reservationName && (
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Guest Name</p>
                        <p className="font-bold text-foreground mt-1">{effectiveTable.reservationName}</p>
                      </div>
                    )}
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground text-xs font-medium uppercase">Start Time</p>
                      <p className="font-bold text-foreground mt-1">
                        {new Date(effectiveTable.reservationStart).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {effectiveTable.reservationEnd && (
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">End Time</p>
                        <p className="font-bold text-foreground mt-1">
                          {new Date(effectiveTable.reservationEnd).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assigned Reservations */}
            {Array.isArray(reservationsQuery.data) && (reservationsQuery.data as any[]).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Guest Reservations
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {reservationsQuery.data.length} total
                  </Badge>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                  <Card className="border border-primary/20 overflow-hidden">
                    <CardContent
                      className="p-0"
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    >
                      {/* Carousel Slide */}
                      {(() => {
                        const reservations = (reservationsQuery.data as any[]) || [];
                        if (reservations.length === 0) {
                          return (
                            <div className="p-6 text-center text-muted-foreground">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No reservations</p>
                            </div>
                          );
                        }

                        const current = reservations[reservationIndex % reservations.length];
                        const start = current.startTime || current.reservationStart || current.createdAt;

                        return (
                          <div key={current.reservationId || current.id} className="p-6">
                            {/* Guest Info Section */}
                            <div className="mb-6 pb-6 border-b border-primary/20">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full">
                                      <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase">Guest Name</p>
                                      <p className="font-bold text-lg">
                                        {current.customerName || current.reservationName || current.customerFullName || 'Guest'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Badge className="flex-shrink-0 bg-secondary/20 text-secondary hover:bg-secondary/30">
                                  {current.guestNumber ?? current.guest ?? current.partySize ?? '-'} guests
                                </Badge>
                              </div>
                            </div>

                            {/* Contact Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium uppercase">Email</span>
                                </div>
                                <p className="font-medium text-sm ml-6 break-all">{current.customerEmail || 'N/A'}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium uppercase">Phone</span>
                                </div>
                                <p className="font-medium text-sm ml-6">{current.customerPhone || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Time & Status Section */}
                            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-primary/20">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium uppercase">Start Time</span>
                                </div>
                                <p className="font-bold text-sm ml-6">{start ? new Date(start).toLocaleString() : '-'}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Receipt className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-medium uppercase">Status</span>
                                </div>
                                <div className="ml-6">
                                  <Badge
                                    className={`text-white font-semibold ${
                                      (current.status || '').toLowerCase() === 'confirmed'
                                        ? 'bg-primary'
                                        : (current.status || '').toLowerCase() === 'approved'
                                          ? 'bg-secondary'
                                          : 'bg-muted'
                                    }`}
                                  >
                                    {(current.status || 'Pending').charAt(0).toUpperCase() + (current.status || 'Pending').slice(1).toLowerCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Special Notes */}
                            {current.note && (
                              <div className="mt-6 p-3 bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40 rounded-lg">
                                <p className="text-xs font-semibold text-primary uppercase mb-1">Special Notes</p>
                                <p className="text-sm text-foreground">{current.note}</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Navigation Controls */}
                  {reservationsQuery.data.length > 1 && (
                    <>
                      <button
                        aria-label="Previous reservation"
                        onClick={() =>
                          setReservationIndex(i => (i - 1 + reservationsQuery.data.length) % reservationsQuery.data.length)
                        }
                        className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border-2 border-primary/30 hover:border-primary rounded-full p-2 hover:scale-110 hover:shadow-lg shadow-md transition-all duration-200"
                        type="button"
                      >
                        <ChevronLeft className="w-5 h-5 text-primary" />
                      </button>

                      <button
                        aria-label="Next reservation"
                        onClick={() => setReservationIndex(i => (i + 1) % reservationsQuery.data.length)}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border-2 border-primary/30 hover:border-primary rounded-full p-2 hover:scale-110 hover:shadow-lg shadow-md transition-all duration-200"
                        type="button"
                      >
                        <ChevronRight className="w-5 h-5 text-primary" />
                      </button>

                      {/* Pagination Dots */}
                      <div className="flex gap-2 justify-center mt-4 pb-2">
                        {Array.from({ length: reservationsQuery.data.length }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setReservationIndex(idx)}
                            className={`transition-all duration-300 rounded-full ${
                              reservationIndex % reservationsQuery.data.length === idx
                                ? 'w-3 h-3 bg-primary shadow-md'
                                : 'w-2 h-2 bg-muted hover:bg-muted-foreground/40'
                            }`}
                            aria-label={`Show reservation ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* No Reservations Message */}
            {(!Array.isArray(reservationsQuery.data) || (reservationsQuery.data as any[]).length === 0) && !effectiveTable.reservationStart && (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No reservations for this table</p>
                <p className="text-xs text-muted-foreground mt-1">This table is currently available</p>
              </div>
            )}
          </div>
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
