import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { ManagerTableManagementEnhanced } from '@/components/manager/ManagerTableManagementEnhanced';
import { isStaffAccountDTO } from '@/utils/typeCast';

const TablesPage = () => {
  const { user } = useSessionStore();
  const branchId = isStaffAccountDTO(user) ? user.branchId : "";
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
        <ManagerTableManagementEnhanced
          branchId={branchId}
          hideAddButtons={true}
          disableStatusChange={true}
          allowBranchSelection={false}
        />
      </div>
    </div>
  );
};

export default TablesPage;
