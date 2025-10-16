import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2, QrCode, Eye } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';
import { TableQRDialog } from '@/components/owner/TableQRDialog';

interface TableStatusViewProps {
  branchId: string;
}

export const TableStatusView = ({ branchId }: TableStatusViewProps) => {
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const { getTablesByBranchAndFloor } = useTableStore();

  const floorMap = getTablesByBranchAndFloor(branchId);
  const tables = Array.from(floorMap.values()).flat();

  const handleShowQR = (table: any) => {
    setSelectedTable(table);
    setIsQRDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-blue-500';
      case 'out_of_service':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'out_of_service':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const tablesByStatus = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    out_of_service: tables.filter(t => t.status === 'out_of_service').length,
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tablesByStatus.available}</div>
            <p className="text-xs text-muted-foreground">Ready for guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tablesByStatus.occupied}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
            <div className="h-3 w-3 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tablesByStatus.out_of_service}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                Table Status
              </CardTitle>
              <CardDescription>
                Real-time view of all table statuses (Read-only)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tables found for this branch.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(floorMap.keys()).sort((a, b) => a - b).map((floor) => {
                const floorTables = floorMap.get(floor) || [];
                const sortedTables = floorTables.sort((a, b) => a.number - b.number);
                
                return (
                  <div key={floor} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg px-4 py-2">
                        <h3 className="text-lg font-semibold text-primary">Floor {floor}</h3>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground">
                        {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {sortedTables.map((table) => (
                        <Card key={table.id} className="border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold text-lg">Table {table.number}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Capacity: {table.capacity} guests
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                  <Badge variant={getStatusVariant(table.status)}>
                                    {table.status}
                                  </Badge>
                                  {table.reservationStart && (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                                      Reserved
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {table.reservationStart && (
                                <div className="text-xs bg-muted/50 p-3 rounded space-y-1">
                                  <p className="font-medium text-sm">Reservation Details</p>
                                  {table.reservationName && (
                                    <p className="text-muted-foreground">Guest: {table.reservationName}</p>
                                  )}
                                  <p className="text-muted-foreground">
                                    From: {new Date(table.reservationStart).toLocaleString()}
                                  </p>
                                  {table.reservationEnd && (
                                    <p className="text-muted-foreground">
                                      To: {new Date(table.reservationEnd).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShowQR(table)}
                                  className="flex-1"
                                >
                                  <QrCode className="mr-1 h-3 w-3" />
                                  View QR Code
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TableQRDialog
        open={isQRDialogOpen}
        onOpenChange={(open) => {
          setIsQRDialogOpen(open);
          if (!open) setSelectedTable(null);
        }}
        table={selectedTable}
      />
    </>
  );
};
