import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const TablesPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  // const { getTablesByBranchAndFloor } = useTableStore();

  // const floorMap = getTablesByBranchAndFloor(branchId);
  // const branchTables = Array.from(floorMap.values()).flat().filter(t => t.status !== 'out_of_service');
  // const availableTables = branchTables.filter(t => t.status === 'available');
  // const occupiedTables = branchTables.filter(t => t.status === 'occupied');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'occupied':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
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
        <h2 className="text-2xl font-semibold">Table Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{availableTables.length}</div> */}
            <p className="text-xs text-muted-foreground">
              Ready for guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{occupiedTables.length}</div> */}
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* {Array.from(floorMap.keys()).sort((a, b) => a - b).map((floor) => {
          const floorTables = (floorMap.get(floor) || [])
            .sort((a, b) => a.number - b.number);
          
          if (floorTables.length === 0) return null;
          
          return (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg px-4 py-2">
                  <h3 className="text-lg font-semibold text-primary">Area {floor}</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {floorTables.map((table) => (
                  <Card key={table.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(table.status)}
                          <CardTitle className="text-lg">Table {table.number}</CardTitle>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant={getStatusColor(table.status)}>
                            {table.status}
                          </Badge>
                          {table.reservationStart && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                              Reserved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Capacity: {table.capacity} guests</span>
                      </div>

                      {table.reservationName && table.reservationStart && (
                        <div className="p-3 bg-muted rounded-lg space-y-1">
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Reservation Details
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Guest: {table.reservationName}</p>
                            <p>From: {new Date(table.reservationStart).toLocaleString()}</p>
                            {table.reservationEnd && (
                              <p>To: {new Date(table.reservationEnd).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
};

export default TablesPage;
