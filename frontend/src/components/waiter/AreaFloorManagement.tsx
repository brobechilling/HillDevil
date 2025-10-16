import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTableStore, TableStatus } from '@/store/tableStore';
import { useAuthStore } from '@/store/authStore';
import { TableDetailsDialog } from './TableDetailsDialog';
import { TableStatusDialog } from './TableStatusDialog';
import { Settings } from 'lucide-react';
import { format, isWithinInterval, addMinutes } from 'date-fns';

export const AreaFloorManagement = () => {
  const { user } = useAuthStore();
  const branchId = (user && 'branchId' in user) ? (user as any).branchId : undefined;
  const allTables = useTableStore((state) => state.tables);
  const tables = allTables.filter(t => t.branchId === branchId);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [statusDialogTableId, setStatusDialogTableId] = useState<string | null>(null);

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'out_of_service':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TableStatus) => {
    switch (status) {
      case 'out_of_service':
        return 'Out of Service';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canSeatCustomer = (table: typeof tables[0]) => {
    // Only available tables can seat customers
    // Out of service tables should not be shown
    return table.status === 'available';
  };

  if (!branchId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Branch not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Area / Floor Management</CardTitle>
          <CardDescription>View and manage table statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tables available</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tables
                .filter(table => table.status !== 'out_of_service')
                .map((table) => {
                const canSeat = canSeatCustomer(table);
                
                return (
                  <Card 
                    key={table.id} 
                    className="border-border/50 relative"
                  >
                    <CardContent className="pt-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDialogTableId(table.id);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>

                      <div 
                        className="flex flex-col items-center text-center space-y-3 cursor-pointer"
                        onClick={() => setSelectedTableId(table.id)}
                      >
                        <h3 className="font-bold text-2xl">Table {table.number}</h3>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {table.capacity}
                        </p>
                        <Badge variant={getStatusColor(table.status)}>
                          {getStatusLabel(table.status)}
                        </Badge>

                        {table.reservationStart && table.reservationName && (
                          <div className="text-xs text-muted-foreground space-y-1 w-full">
                            <p className="font-medium">Reserved by:</p>
                            <p>{table.reservationName}</p>
                            <p>{format(new Date(table.reservationStart), 'PPp')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TableDetailsDialog
        tableId={selectedTableId}
        branchId={branchId}
        open={!!selectedTableId}
        onOpenChange={(open) => !open && setSelectedTableId(null)}
      />

      <TableStatusDialog
        tableId={statusDialogTableId}
        open={!!statusDialogTableId}
        onOpenChange={(open) => !open && setStatusDialogTableId(null)}
      />
    </>
  );
};
