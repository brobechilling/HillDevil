import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTablesByBranch, useCreateTable, useDeleteTable, useTableQrCode } from '@/hooks/queries/useTables';
import { useAreaStore } from '@/store/areaStore';
import { Plus, Trash2, QrCode, Loader2 } from 'lucide-react';

interface OwnerTablesProps {
  branchId: string;
}

export const OwnerTables = ({ branchId }: OwnerTablesProps) => {
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [qrTableId, setQrTableId] = useState<string | null>(null);
  const [isQROpen, setIsQROpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  // Form state
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [tableTag, setTableTag] = useState('');
  const [capacity, setCapacity] = useState('2');

  const { data: tablesData, isLoading } = useTablesByBranch(branchId, page, 20);
  const createTableMutation = useCreateTable();
  const deleteTableMutation = useDeleteTable();
  const { data: qrDataUrl } = useTableQrCode(qrTableId);

  const { getAreasByBranch } = useAreaStore();
  const areas = getAreasByBranch(branchId);

  const handleCreateTable = async () => {
    if (!selectedAreaId || !tableTag || !capacity) {
      return;
    }

    await createTableMutation.mutateAsync({
      areaId: selectedAreaId,
      tag: tableTag,
      capacity: parseInt(capacity),
    });

    // Reset form
    setSelectedAreaId('');
    setTableTag('');
    setCapacity('2');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTable = async () => {
    if (tableToDelete) {
      await deleteTableMutation.mutateAsync(tableToDelete);
      setTableToDelete(null);
    }
  };

  const handleViewQR = (tableId: string) => {
    setQrTableId(tableId);
    setIsQROpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      case 'RESERVED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tables = tablesData?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tables Management</h2>
          <p className="text-muted-foreground">Manage tables and view QR codes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>Add a new table to your branch</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area/Floor</Label>
                <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name} (Floor {area.floor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Table Name/Tag</Label>
                <Input
                  id="tag"
                  placeholder="e.g., A1, Corner Table"
                  value={tableTag}
                  onChange={(e) => setTableTag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12, 16, 20].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateTable}
                disabled={!selectedAreaId || !tableTag || createTableMutation.isPending}
                className="w-full"
              >
                {createTableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Table'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No tables found</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Create your first table</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{table.tag}</CardTitle>
                    <CardDescription>Capacity: {table.capacity} seats</CardDescription>
                  </div>
                  <Badge className={getStatusColor(table.status)}>
                    {table.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {table.reservedBy && (
                    <div className="text-sm text-muted-foreground">
                      Reserved by: <span className="font-medium">{table.reservedBy}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleViewQR(table.id)}
                    >
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => setTableToDelete(table.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Table QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to access the table menu
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Table QR Code" className="w-64 h-64 border rounded" />
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-muted rounded">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {qrDataUrl && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrDataUrl;
                  link.download = `table-${qrTableId}-qr.png`;
                  link.click();
                }}
              >
                Download QR Code
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              disabled={deleteTableMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
