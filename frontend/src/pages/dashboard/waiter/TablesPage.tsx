import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useTables } from '@/hooks/queries/useTables';
import { useQuery } from '@tanstack/react-query';
import { getReservationsByTable as apiGetReservationsByTable } from '@/api/reservationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Calendar } from 'lucide-react';
import { TableStatusDialog } from '@/components/waiter/TableStatusDialog';
import { TableDetailsDialog } from '@/components/waiter/TableDetailsDialog';

const TablesPage = () => {
  const { user } = useSessionStore();
  const branchId = (user as any)?.branchId || '';
  const tablesQuery = useTables(branchId || undefined, 0, 200);

  // Debugging log
  console.debug('TablesPage: branchId=', branchId, 'status=', tablesQuery.status, 'data=', tablesQuery.data);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [reservationIndexMap, setReservationIndexMap] = useState<Map<string, number>>(new Map());

  const tablesDataArr: any[] = Array.isArray(tablesQuery.data)
    ? (tablesQuery.data as any)
    : (tablesQuery.data && (tablesQuery.data as any).content)
      ? (tablesQuery.data as any).content
      : [];

  const areaMap = ((): Map<string, any[]> => {
    const map = new Map<string, any[]>();
    const source = tablesDataArr.length > 0 ? tablesDataArr : [];

    (source || []).forEach((t: any) => {
      const areaId = t.areaId || t.area || 'unknown';
      const arr = map.get(areaId) || [];
      const rawStatus = (t.status || 'ACTIVE').toString().toLowerCase();
      const status = rawStatus === 'free' ? 'available' : rawStatus;
      arr.push({ ...t, status });
      map.set(areaId, arr);
    });

    return map;
  })();

  const handleViewDetails = (table: any) => {
    setSelectedTable(table);
    setDetailsDialogOpen(true);
  };

  const handleChangeStatus = (table: any) => {
    setSelectedTable(table);
    setStatusDialogOpen(true);
  };

  const getCurrentReservationIndex = (tableId: string) => {
    return reservationIndexMap.get(tableId) || 0;
  };

  const handleNextReservation = (tableId: string, maxIndex: number) => {
    setReservationIndexMap(prev => {
      const next = new Map(prev);
      const currentIndex = getCurrentReservationIndex(tableId);
      const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      next.set(tableId, newIndex);
      return next;
    });
  };

  const handlePrevReservation = (tableId: string, maxIndex: number) => {
    setReservationIndexMap(prev => {
      const next = new Map(prev);
      const currentIndex = getCurrentReservationIndex(tableId);
      const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      next.set(tableId, newIndex);
      return next;
    });
  };

  const getStatusColor = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // --------------------------
  // Table Card Component
  // --------------------------
  const TableCard = ({ table }: { table: any }) => {
    const { data: tableReservations = [] } = useQuery({
      queryKey: ['reservations', 'table', table.id],
      queryFn: () => apiGetReservationsByTable(table.id),
      enabled: !!table.id,
    });

    return (
      <Card className="flex flex-col justify-between w-full max-w-[320px] h-full min-h-[150px] bg-card border border-border rounded-2xl shadow-md hover:shadow-lg hover:border-primary/40 transition-all duration-200 ease-in-out overflow-hidden">
        {/* Header */}
        <CardHeader className="p-3 pb-1">

          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {table.tag || (table.number ? `Table ${table.number}` : 'Table')}
              </CardTitle>
              <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Capacity: <span className="font-medium">{table.capacity}</span> guests
                  </span>
                </div>
                {tableReservations.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                  >
                    <Calendar className="h-3 w-3 mr-1 inline-block" />
                    {tableReservations.length}{' '}
                    {tableReservations.length === 1 ? 'Reservation' : 'Reservations'}
                  </Badge>
                )}
              </div>
            </div>

            <Badge
              variant={getStatusColor(table.status)}
              className="uppercase px-3 py-1 rounded-md text-xs font-semibold"
            >
              {table.status}
            </Badge>
          </div>
        </CardHeader>

        {/* Buttons (always at bottom) */}
        <CardContent className="mt-auto p-3 pt-1">
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              className="flex-1 basis-1/2 flex items-center justify-center gap-2"
              onClick={() => handleViewDetails(table)}
            >
              <Eye className="h-4 w-4" />
              Details
            </Button>
            <Button
              className="flex-1 basis-1/2 flex items-center justify-center gap-2"
              onClick={() => handleChangeStatus(table)}
            >
              Change Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };


  // --------------------------
  // Page Layout
  // --------------------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Table Management</h2>
      </div>

      <div className="space-y-6">
        {Array.from(areaMap.entries())
          .sort((a: any, b: any) => {
            const aName = (a[1] && a[1][0] && a[1][0].areaName) || '';
            const bName = (b[1] && b[1][0] && b[1][0].areaName) || '';
            return aName.localeCompare(bName);
          })
          .map(([areaId, areaTables]) => {
            const filtered = (areaTables || [])
              .filter((t: any) => t.status !== 'out_of_service')
              .sort((a: any, b: any) => {
                const an = Number(a.number || 0);
                const bn = Number(b.number || 0);
                if (an && bn) return an - bn;
                const at = (a.tag || '').toString();
                const bt = (b.tag || '').toString();
                return at.localeCompare(bt);
              });

            if (filtered.length === 0) return null;

            const areaName = (filtered[0] && filtered[0].areaName) || 'Area';

            return (
              <div key={String(areaId)} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-3 bg-primary/10 hover:bg-primary/20 transition-colors rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-primary">{areaName}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-primary/5 rounded-md">
                      {filtered.length} tables
                    </span>
                  </div>
                </div>

                <div className="grid gap-x-0 gap-y-6 grid-cols-[repeat(auto-fit,minmax(360px,1fr))] items-stretch justify-items-center">
                  {filtered.map((table) => (
                    <TableCard key={table.id} table={table} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {selectedTable && (
        <>
          <TableStatusDialog
            tableId={selectedTable?.id}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
          <TableDetailsDialog
            table={selectedTable}
            tableId={selectedTable?.id}
            branchId={branchId}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default TablesPage;
