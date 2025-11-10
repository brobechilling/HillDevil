import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Calendar } from 'lucide-react';
import { TableStatusDialog } from '@/components/waiter/TableStatusDialog';
import { TableDetailsDialog } from '@/components/waiter/TableDetailsDialog';

const TablesPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  // const { getTablesByBranchAndFloor } = useTableStore();
  // const { getReservationsByTable } = useReservationStore();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [reservationIndexMap, setReservationIndexMap] = useState<Map<string, number>>(new Map());

  // Lấy map floor -> tables
  // const floorMap = getTablesByBranchAndFloor(branchId);

  const handleViewDetails = (id: string) => {
    setSelectedTable(id);
    setDetailsDialogOpen(true);
  };

  const handleChangeStatus = (id: string) => {
    setSelectedTable(id);
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
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Table Management</h2>
      </div>

      <div className="space-y-6">
        {/* {Array.from(floorMap.keys())
          .sort((a: any, b: any) => Number(a) - Number(b))
          .map((floor) => {
            const floorTables = (floorMap.get(floor) || [])
              .filter((t) => t.status !== 'out_of_service')
              .sort((a, b) => a.number - b.number);

            if (floorTables.length === 0) return null;

            return (
              <div key={String(floor)} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg px-4 py-2">
                    <h3 className="text-lg font-semibold text-primary">Floor {floor}</h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {floorTables.map((table) => {
                    const tableReservations = getReservationsByTable(table.id);

                    return (
                      <Card key={table.id} className="flex flex-col h-full overflow-hidden">
                        <CardHeader className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Table {table.number}</CardTitle>
                            <Badge variant={getStatusColor(table.status)}>{table.status}</Badge>
                          </div>

                          <div className="flex gap-2 items-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Capacity: {table.capacity} guests
                            </span>

                            {tableReservations.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {tableReservations.length}{' '}
                                {tableReservations.length === 1 ? 'Reservation' : 'Reservations'}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="mt-auto flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewDetails(table.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button className="flex-1" onClick={() => handleChangeStatus(table.id)}>
                            Change Status
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })} */}
      </div>

      {selectedTable && (
        <>
          <TableStatusDialog
            tableId={selectedTable}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
          <TableDetailsDialog
            tableId={selectedTable}
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
