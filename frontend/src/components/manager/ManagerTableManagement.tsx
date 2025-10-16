import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2, Eye } from 'lucide-react';
import { useTableStore, TableStatus } from '@/store/tableStore';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ManagerTableManagementProps {
  branchId: string;
}

export const ManagerTableManagement = ({ branchId }: ManagerTableManagementProps) => {
  const { getTablesByBranchAndFloor, updateTableStatus } = useTableStore();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const floorMap = getTablesByBranchAndFloor(branchId);
  const tables = Array.from(floorMap.values()).flat();

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    updateTableStatus(tableId, newStatus);
    toast({
      title: 'Table status updated',
      description: `Table status has been changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleViewDetails = (table: any) => {
    setSelectedTable(table);
    setDialogOpen(true);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'out_of_service':
        return 'Out of Service';
      default:
        return status;
    }
  };

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const outOfServiceTables = tables.filter(t => t.status === 'out_of_service').length;

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableTables}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <div className="h-3 w-3 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupiedTables}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
              <div className="h-3 w-3 rounded-full bg-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfServiceTables}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Table Management
            </CardTitle>
            <CardDescription>
              Manage table status and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tables available</p>
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
                          <Card 
                            key={table.id} 
                            className={`border-2 hover:shadow-lg transition-shadow ${
                              table.status === 'out_of_service' ? 'opacity-50' : ''
                            }`}
                          >
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
                                    <Badge className={getStatusColor(table.status)}>
                                      {getStatusLabel(table.status)}
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

                                <div className="space-y-2">
                                  <Select
                                    value={table.status}
                                    onValueChange={(value) => handleStatusChange(table.id, value as TableStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="available">Available</SelectItem>
                                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(table)}
                                    className="w-full"
                                  >
                                    <Eye className="mr-2 h-3 w-3" />
                                    View Details
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table Details</DialogTitle>
            <DialogDescription>
              View complete table information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Table Number</p>
                  <p className="font-semibold">{selectedTable.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-semibold">{selectedTable.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">{selectedTable.capacity} guests</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedTable.status)}>
                    {getStatusLabel(selectedTable.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">QR Code</p>
                  <p className="font-mono text-xs">{selectedTable.qrCode}</p>
                </div>
              </div>

              {selectedTable.reservationStart && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                      Reserved
                    </Badge>
                    Reservation Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTable.reservationName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Guest Name</p>
                        <p className="font-semibold">{selectedTable.reservationName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Start Time</p>
                      <p className="font-semibold">
                        {new Date(selectedTable.reservationStart).toLocaleString()}
                      </p>
                    </div>
                    {selectedTable.reservationEnd && (
                      <div>
                        <p className="text-sm text-muted-foreground">End Time</p>
                        <p className="font-semibold">
                          {new Date(selectedTable.reservationEnd).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
