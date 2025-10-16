import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table2, Plus, QrCode, Settings, Trash2 } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';
import { TableDialog } from '@/components/owner/TableDialog';
import { TableQRDialog } from '@/components/owner/TableQRDialog';
import { toast } from '@/hooks/use-toast';

interface TableManagementFullProps {
  branchId: string;
}

export const TableManagementFull = ({ branchId }: TableManagementFullProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const { getTablesByBranch, deleteTable } = useTableStore();

  const tables = getTablesByBranch(branchId);

  const handleEdit = (table: any) => {
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  const handleShowQR = (table: any) => {
    setSelectedTable(table);
    setIsQRDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTable(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTable(id);
    setTableToDelete(null);
    toast({
      title: 'Table deleted',
      description: 'The table has been successfully removed.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                Table Management
              </CardTitle>
              <CardDescription>
                Manage tables and seating arrangements for your branch
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tables yet. Add your first table to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => (
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
                        <Badge className={getStatusColor(table.status)}>
                          {table.status}
                        </Badge>
                      </div>

                      {table.reservationStart && (
                        <div className="text-xs bg-muted/50 p-2 rounded">
                          <p className="font-medium">Reserved</p>
                          <p className="text-muted-foreground">
                            {new Date(table.reservationStart).toLocaleString()}
                          </p>
                          {table.reservationName && (
                            <p className="text-muted-foreground">For: {table.reservationName}</p>
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
                          QR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(table)}
                          className="flex-1"
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTableToDelete(table.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TableDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedTable(null);
        }}
        table={selectedTable}
        branchId={branchId}
      />

      <TableQRDialog
        open={isQRDialogOpen}
        onOpenChange={(open) => {
          setIsQRDialogOpen(open);
          if (!open) setSelectedTable(null);
        }}
        table={selectedTable}
      />

      <AlertDialog open={!!tableToDelete} onOpenChange={() => setTableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => tableToDelete && handleDelete(tableToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
