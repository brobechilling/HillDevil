import { useState } from 'react';
import { useTables } from '@/hooks/queries/useTables';
import { useReservationsByTable } from '@/hooks/queries/useReservationsByTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Calendar } from 'lucide-react';
import { TableStatusDialog } from '@/components/waiter/TableStatusDialog';
import { TableDetailsDialog } from '@/components/waiter/TableDetailsDialog';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';

const TablesPage = () => {
  const { user } = useSessionStore();
  const branchId = isStaffAccountDTO(user) ? user.branchId : "";
  // const { getTablesByBranchAndFloor } = useTableStore();
  // const { getReservationsByTable } = useReservationStore();
  const tablesQuery = useTables(branchId || undefined, 0, 200);


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
      arr.push(t);
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

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'FREE':
        return '✓';
      case 'OCCUPIED':
        return '👥';
      case 'ACTIVE':
        return '●';
      case 'INACTIVE':
        return '⊗';
      default:
        return '●';
    }
  };

  const TableCard = ({ table }: { table: any }) => {
    const { data: tableReservations = [] } = useReservationsByTable(table.id);
    const normalizedStatus = table.status?.toUpperCase();
    const isAvailable = normalizedStatus === 'FREE';
    const isOccupied = normalizedStatus === 'OCCUPIED';
    const isInactive = normalizedStatus === 'INACTIVE';

    return (
      <Card
        className={`relative flex flex-col justify-between w-full max-w-[320px] h-full min-h-[200px] rounded-lg overflow-hidden cursor-pointer group border ${isAvailable
            ? 'border-primary/20'
            : isOccupied
              ? 'border-destructive/20'
              : 'border-secondary/20'
          }`}
      >
        {/* Status Indicator Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={`uppercase px-3 py-1 rounded-full text-xs font-bold shadow-md text-white ${isAvailable
                ? 'bg-primary hover:bg-primary/90'
                : isOccupied
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-secondary hover:bg-secondary/90'
              }`}
          >
            {getStatusIcon(table.status)} {table.status}
          </Badge>
        </div>

        {/* Header */}
        <CardHeader className="p-4 pb-2">
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold text-foreground">
              {table.tag || (table.number ? `Table ${table.number}` : 'Table')}
            </CardTitle>

            {/* Capacity Info */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Capacity:</span>
              <span className="font-bold text-lg text-primary">{table.capacity}</span>
              <span>guests</span>
            </div>

            {/* Reservations Badge */}
            {tableReservations.length > 0 && (
              <Badge className="w-fit bg-accent/20 text-accent hover:bg-accent/30 border border-accent/50 text-xs font-semibold px-3 py-1 rounded-full">
                <Calendar className="h-3 w-3 mr-1 inline-block" />
                {tableReservations.length} {tableReservations.length === 1 ? 'Reservation' : 'Reservations'}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Buttons (always at bottom) */}
        <CardContent className="mt-auto p-4 pt-2">
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-primary/20"
              onClick={() => handleViewDetails(table)}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Info</span>
            </Button>
            <Button
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-white ${isAvailable
                  ? 'bg-primary hover:bg-primary/90'
                  : isOccupied
                    ? 'bg-destructive hover:bg-destructive/90'
                    : 'bg-secondary hover:bg-secondary/90'
                }`}
              onClick={() => handleChangeStatus(table)}
            >
              <span className="hidden sm:inline">Status</span>
              <span className="sm:hidden">Change</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-8 p-2 md:p-0">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Table Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all restaurant tables</p>
          </div>
        </div>
      </div>

      {/* Tables by Area */}
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
            const areaAvailable = filtered.filter((t: any) => t.status?.toUpperCase() === 'FREE').length;
            const areaOccupied = filtered.filter((t: any) => t.status?.toUpperCase() === 'OCCUPIED').length;

            return (
              <div key={String(areaId)} className="space-y-4">
                {/* Area Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all rounded-full px-4 py-2 border border-primary/20">
                      <span className="text-sm font-bold text-primary">{areaName}</span>
                      <span className="text-xs font-semibold text-muted-foreground bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                        {filtered.length} tables
                      </span>
                    </div>
                  </div>

                  {/* Area Stats */}
                  <div className="hidden sm:flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">
                      <span className="font-bold">{areaAvailable}</span>
                      <span>free</span>
                    </div>
                    {areaOccupied > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 dark:bg-destructive/20 text-destructive">
                        <span className="font-bold">{areaOccupied}</span>
                        <span>in use</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Cards Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((table) => (
                    <TableCard key={table.id} table={table} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Empty State */}
      {tablesDataArr.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <div className="h-12 w-12 mx-auto text-gray-400 mb-4 opacity-50 text-2xl">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No tables available</h3>
            <p className="text-gray-500 dark:text-gray-400">Tables will appear here once they are added to your branch.</p>
          </CardContent>
        </Card>
      )}

      {selectedTable && (
        <>
          <TableStatusDialog
            tableId={selectedTable?.id}
            tableName={selectedTable?.tag || `Table ${selectedTable?.number}`}
            currentStatus={selectedTable?.status}
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
