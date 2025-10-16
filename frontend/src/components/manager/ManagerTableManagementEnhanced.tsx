import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2, Eye, Settings, ChevronLeft, ChevronRight, Plus, QrCode } from 'lucide-react';
import { useTableStore, TableStatus } from '@/store/tableStore';
import { useAreaStore } from '@/store/areaStore';
import { useReservationStore } from '@/store/reservationStore';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { TableDialog } from '@/components/owner/TableDialog';
import { TableQRDialog } from '@/components/owner/TableQRDialog';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ManagerTableManagementEnhancedProps {
  branchId: string;
}

export const ManagerTableManagementEnhanced = ({ branchId }: ManagerTableManagementEnhancedProps) => {
  const { getTablesByBranchAndFloor, updateTableStatus } = useTableStore();
  const { getAreasByBranch, updateArea } = useAreaStore();
  const { getReservationsByTable } = useReservationStore();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservationIndex, setReservationIndex] = useState(0);

  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrTable, setQrTable] = useState<any>(null);

  const [areaName, setAreaName] = useState('');
  const [areaFloor, setAreaFloor] = useState<number>(1);

  const [initialTableCount, setInitialTableCount] = useState<number>(0);

  const floorMap = getTablesByBranchAndFloor(branchId);
  const tables = Array.from(floorMap.values()).flat();
  const areas = getAreasByBranch(branchId);

  const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
  const branch = branches.find((b: any) => b.id === branchId);
  const branchShortCode = branch?.shortCode || branchId;

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    updateTableStatus(tableId, newStatus);
    toast({
      title: 'Table status updated',
      description: `Table status has been changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleAreaStatusChange = (areaId: string, newStatus: 'active' | 'inactive') => {
    updateArea(areaId, { status: newStatus });
    toast({
      title: 'Area status updated',
      description: `Area has been marked as ${newStatus}.`,
    });
  };

  const handleViewDetails = (table: any) => {
    setSelectedTable(table);
    setReservationIndex(0);
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

  const getAreaByFloor = (floor: number) => {
    return areas.find(a => a.floor === floor);
  };

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const outOfServiceTables = tables.filter(t => t.status === 'out_of_service').length;

  const selectedTableReservations = selectedTable ? getReservationsByTable(selectedTable.id) : [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <Button onClick={() => setIsAreaDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
            <Button onClick={() => { setInitialTableCount(tables.length); setIsAddTableOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
            <Button variant="outline" onClick={() => setIsQRDialogOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Branch QR
            </Button>
          </div>
        </div>
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
              Table Management by Floor
            </CardTitle>
            <CardDescription>
              Manage table status, area status, and view reservations
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
                  const area = getAreaByFloor(floor);
                  const isInactive = area?.status === 'inactive';
                  
                  return (
                    <div key={floor} className={cn(
                      "space-y-3 transition-opacity",
                      isInactive && "opacity-40 blur-sm"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg px-4 py-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-primary">{area?.name || `Area ${floor}`}</h3>
                          {area && (
                            <Select 
                              value={area.status} 
                              onValueChange={(value) => handleAreaStatusChange(area.id, value as 'active' | 'inactive')}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">
                          {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sortedTables.map((table) => {
                          const reservations = getReservationsByTable(table.id);
                          
                          return (
                            <Card 
                              key={table.id} 
                              className={cn(
                                "border-2 hover:shadow-lg transition-all",
                                table.status === 'out_of_service' && 'opacity-50'
                              )}
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
                                      {reservations.length > 0 && (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                                          {reservations.length} reservation{reservations.length > 1 ? 's' : ''}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Select
                                      value={table.status}
                                      onValueChange={(value) => handleStatusChange(table.id, value as TableStatus)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-background">
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="out_of_service">Out of Service</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewDetails(table)}
                                        className="flex-1"
                                      >
                                        <Eye className="mr-2 h-3 w-3" />
                                        Details
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setQrTable(table);
                                          setIsQRDialogOpen(true);
                                        }}
                                        className="flex-1"
                                      >
                                        <QrCode className="mr-2 h-3 w-3" />
                                        QR
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Table Details</DialogTitle>
            <DialogDescription>
              View complete table information and reservations
            </DialogDescription>
          </DialogHeader>
          
          {selectedTable && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Table Number</p>
                  <p className="font-semibold">{selectedTable.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
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
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">QR Code URL</p>
                  <div className="flex gap-2">
                    <Input 
                      value={`${window.location.origin}/branch/${branchShortCode}/table/${selectedTable.id}`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/branch/${branchShortCode}/table/${selectedTable.id}`);
                        toast({ title: 'Copied!', description: 'URL copied to clipboard' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              {selectedTableReservations.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                        {selectedTableReservations.length} Reservation{selectedTableReservations.length > 1 ? 's' : ''}
                      </Badge>
                    </h4>
                    {selectedTableReservations.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReservationIndex(Math.max(0, reservationIndex - 1))}
                          disabled={reservationIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {reservationIndex + 1} / {selectedTableReservations.length}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReservationIndex(Math.min(selectedTableReservations.length - 1, reservationIndex + 1))}
                          disabled={reservationIndex === selectedTableReservations.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedTableReservations[reservationIndex] && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Guest Name</p>
                          <p className="font-semibold">{selectedTableReservations[reservationIndex].guestName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Guests</p>
                          <p className="font-semibold">{selectedTableReservations[reservationIndex].numberOfGuests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Time</p>
                          <p className="font-semibold">
                            {format(new Date(selectedTableReservations[reservationIndex].reservationStart), 'PPp')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Time</p>
                          <p className="font-semibold">
                            {format(new Date(selectedTableReservations[reservationIndex].reservationEnd), 'PPp')}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="text-sm">{selectedTableReservations[reservationIndex].guestEmail}</p>
                          <p className="text-sm">{selectedTableReservations[reservationIndex].guestPhone}</p>
                        </div>
                        {selectedTableReservations[reservationIndex].notes && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{selectedTableReservations[reservationIndex].notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Table Dialog (reusing owner TableDialog) */}
      <TableDialog
        open={isAddTableOpen}
        onOpenChange={(open) => {
          if (!open) {
            const allTables = useTableStore.getState().getTablesByBranch(branchId);
            if (allTables.length > initialTableCount) {
              const latest = allTables.reduce((a, b) => (a.id > b.id ? a : b));
              setQrTable(latest);
              setIsQRDialogOpen(true);
            }
          }
          setIsAddTableOpen(open);
        }}
        branchId={branchId}
      />

      {/* Table QR Dialog */}
      <TableQRDialog
        open={isQRDialogOpen && !!qrTable}
        onOpenChange={(open) => {
          setIsQRDialogOpen(open);
          if (!open) setQrTable(null);
        }}
        table={qrTable}
      />

      {/* Add Area Dialog */}
      <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Area</DialogTitle>
            <DialogDescription>Create a new area/floor for this branch</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="areaName">Area Name</Label>
              <Input id="areaName" value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="e.g. Patio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaFloor">Floor Number</Label>
              <Input id="areaFloor" type="number" min={1} value={areaFloor} onChange={(e) => setAreaFloor(parseInt(e.target.value || '1', 10))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAreaDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!areaFloor) return;
                useAreaStore.getState().addArea({ branchId, name: areaName || `Area ${areaFloor}`, floor: areaFloor, status: 'active' });
                toast({ title: 'Area added', description: 'New area has been created.' });
                setAreaName('');
                setAreaFloor(1);
                setIsAreaDialogOpen(false);
              }}>Add Area</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Branch QR Dialog */}
      <Dialog open={isQRDialogOpen && !qrTable} onOpenChange={(open) => setIsQRDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Branch QR Code</DialogTitle>
            <DialogDescription>Scan to open the branch page</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-6 rounded-lg border-2 border-border">
              <QRCodeSVG value={`${window.location.origin}/branch/${branchShortCode}`} size={200} />
            </div>
            <div className="text-sm font-mono select-all break-all">
              {`${window.location.origin}/branch/${branchShortCode}`}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table QR Dialog */}
      <TableQRDialog
        open={isQRDialogOpen && !!qrTable}
        onOpenChange={(open) => {
          setIsQRDialogOpen(open);
          if (!open) setQrTable(null);
        }}
        table={qrTable}
      />

      <TableDialog
        open={isAddTableOpen}
        onOpenChange={setIsAddTableOpen}
        branchId={branchId}
      />
    </>
  );
};
