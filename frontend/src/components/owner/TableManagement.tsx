import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { useTableStore, Table } from '@/store/tableStore';
import { TableDialog } from './TableDialog';
import { TableQRDialog } from './TableQRDialog';
import { toast } from '@/hooks/use-toast';
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

interface TableManagementProps {
  branchId: string;
}

export const TableManagement = ({ branchId }: TableManagementProps) => {
  const allTables = useTableStore((state) => state.tables);
const tables = allTables.filter(t => t.branchId === branchId);
  const deleteTable = useTableStore((state) => state.deleteTable);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | undefined>();
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setIsQRDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTable(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTable(id);
    setTableToDelete(null);
    toast({
      title: 'Table Deleted',
      description: 'The table has been removed.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Management</CardTitle>
              <CardDescription>Manage tables and generate QR codes</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tables yet. Add your first table!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {tables.map((table) => (
                <Card key={table.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">Table {table.number}</h4>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {table.capacity} people
                        </p>
                      </div>
                      <Badge variant={getStatusColor(table.status)}>{table.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShowQR(table)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(table)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setTableToDelete(table.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        table={selectedTable}
      />

      <TableQRDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
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
