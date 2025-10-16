import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table2, Eye, AlertCircle } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';
import { TableQRDialog } from './TableQRDialog';

interface TableManagementReadOnlyProps {
  branches: any[];
}

export const TableManagementReadOnly = ({ branches }: TableManagementReadOnlyProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [qrDialogTable, setQrDialogTable] = useState<any>(null);
  const { getTablesByBranch } = useTableStore();

  const tables = selectedBranchId ? getTablesByBranch(selectedBranchId) : [];
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Table Management (View Only)</CardTitle>
          <CardDescription>
            Select a branch to view its tables and areas. Contact your branch manager for table modifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Branch</label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedBranchId && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Please select a branch to view its tables
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedBranchId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Tables at {selectedBranch?.name}
            </CardTitle>
            <CardDescription>
              Total tables: {tables.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tables found for this branch
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                  <Card key={table.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Table2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">Table {table.number}</span>
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
                              {new Date(table.reservationStart).toLocaleString()} - 
                              {new Date(table.reservationEnd || '').toLocaleString()}
                            </p>
                            {table.reservationName && (
                              <p className="text-muted-foreground">For: {table.reservationName}</p>
                            )}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setQrDialogTable(table)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {qrDialogTable && (
        <TableQRDialog
          table={qrDialogTable}
          open={!!qrDialogTable}
          onOpenChange={(open) => !open && setQrDialogTable(null)}
        />
      )}
    </div>
  );
};
