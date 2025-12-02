import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Table2, Tag, DollarSign, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranch } from '@/hooks/queries/useBranches';
import { useManagerOverview } from '@/hooks/queries/useManagerOverview';
import { useAreas } from '@/hooks/queries/useAreas';
import { useTables } from '@/hooks/queries/useTables';
import { useBranchTodayStats } from '@/hooks/queries/useBranchReports';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';
import { TableDTO } from '@/dto/table.dto';

export default function OverviewPage() {
  const { user } = useSessionStore(); 
  // Get branchId from multiple sources (same as StaffPage)
  const branchIdFromStore = isStaffAccountDTO(user) ? user.branchId : "";
  const branchIdFromSession = sessionStorage.getItem('owner_selected_branch_id') || "";
  const branchId = branchIdFromStore || branchIdFromSession;
  
  const { data: branch, isLoading: isLoadingBranch } = useBranch(branchId);
  const { data: stats, isLoading: isLoadingStats } = useManagerOverview(branchId);
  const { data: todayStats, isLoading: isLoadingTodayStats } = useBranchTodayStats(branchId);
  const { data: areas, isLoading: isLoadingAreas } = useAreas(branchId);
  const { data: tablesData, isLoading: isLoadingTables } = useTables(branchId, 0, 1000);

  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');

  const isLoading = isLoadingBranch || isLoadingStats || isLoadingAreas || isLoadingTables || isLoadingTodayStats;

  // Filter tables by selected area
  const filteredTables = useMemo(() => {
    if (!tablesData?.content) return [];
    if (selectedAreaId === 'all') return tablesData.content;
    return tablesData.content.filter((table) => table.areaId === selectedAreaId);
  }, [tablesData, selectedAreaId]);

  // Group tables by area
  const tablesByArea = useMemo(() => {
    const grouped = new Map<string, TableDTO[]>();
    if (!tablesData?.content) return grouped;
    
    tablesData.content.forEach((table) => {
      const areaId = table.areaId || 'unknown';
      if (!grouped.has(areaId)) {
        grouped.set(areaId, []);
      }
      grouped.get(areaId)!.push(table);
    });
    
    return grouped;
  }, [tablesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Overview</h1>
        <p className="text-muted-foreground mt-2">
          {branch?.address || 'Branch'} - Branch Operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayStats?.todayRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayStats && todayStats.revenueChangePercent !== 0 && (
                <span className={todayStats.revenueChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {todayStats.revenueChangePercent >= 0 ? '+' : ''}
                  {todayStats.revenueChangePercent.toFixed(1)}%
                </span>
              )}
              {todayStats && todayStats.revenueChangePercent === 0 && (
                <span className="text-muted-foreground">No change</span>
              )}
              {!todayStats && <span className="text-muted-foreground">Loading...</span>}
              {' vs yesterday'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeStaff || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats?.totalStaff || 0} total staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Status</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.occupiedTables || 0}/{stats?.totalTables || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tables occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activePromos || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Running promotions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Table Status</CardTitle>
                <CardDescription>Current table availability by floor</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas?.map((area) => (
                      <SelectItem key={area.areaId} value={area.areaId}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tables found
              </div>
            ) : (
              <div className="space-y-4">
                {selectedAreaId === 'all' && areas && areas.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Area Status</h4>
                    {areas.map((area) => {
                      const areaTables = tablesByArea.get(area.areaId) || [];
                      const availableAreaTables = areaTables.filter((t) => t.status !== 'INACTIVE');
                      const occupiedCount = availableAreaTables.filter((t) => t.status === 'OCCUPIED').length;
                      const totalCount = availableAreaTables.length;
                      
                      return (
                        <div key={area.areaId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{area.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {occupiedCount}/{totalCount} tables occupied
                            </div>
                          </div>
                          <Badge variant={area.status ? 'default' : 'secondary'}>
                            {area.status ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {filteredTables.map((table) => {
                    const getStatusColor = (status: string) => {
                      switch (status?.toUpperCase()) {
                        case 'FREE':
                          return 'border-green-500 bg-green-500/10';
                        case 'OCCUPIED':
                          return 'border-red-500 bg-red-500/10';
                        case 'ACTIVE':
                          return 'border-blue-500 bg-blue-500/10';
                        case 'INACTIVE':
                          return 'border-gray-500 bg-gray-500/10';
                        default:
                          return 'border-gray-500 bg-gray-500/10';
                      }
                    };

                    return (
                      <Card
                        key={table.id}
                        className={`border-2 ${getStatusColor(table.status)}`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="font-bold text-lg">#{table.tag}</div>
                          <div className="text-xs text-muted-foreground">
                            {table.areaName || 'No Area'} • {table.capacity} seats
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {table.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Today's performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Total Orders</span>
              <span className="text-lg font-bold">{todayStats?.totalOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Average Order Value</span>
              <span className="text-lg font-bold">
                ${todayStats?.averageOrderValue.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Total Menu Items Sold</span>
              <span className="text-lg font-bold">{todayStats?.totalMenuItemsSold || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
