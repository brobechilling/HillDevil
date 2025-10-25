import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Table2, Tag, DollarSign } from 'lucide-react';
import { mockTables, mockPromotions } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { useAreaStore } from '@/store/areaStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/queries/useBranches';

export default function OverviewPage() {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';
  const { data: branches, isLoading } = useBranches();

  const activeBranch = branches?.find(b => String(b.branchId) === branchId) || branches?.[0];
  const { getStaffByBranch } = useStaffStore();
  const { getAreasByBranch } = useAreaStore();
  const branchStaff = getStaffByBranch(branchId);
  const branchAreas = getAreasByBranch(branchId);
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');

  // Filter tables by selected floor
  const filteredTables = useMemo(() => {
    let tables = mockTables;
    if (selectedFloor !== 'all') {
      tables = tables.filter(t => t.floor === parseInt(selectedFloor));
    }
    if (selectedAreaId !== 'all') {
      const area = branchAreas.find(a => a.id === selectedAreaId);
      if (area) tables = tables.filter(t => t.floor === area.floor);
    }
    return tables;
  }, [selectedFloor, selectedAreaId, branchAreas]);

  // Get unique floors
  const floors = Array.from(new Set(mockTables.map(t => t.floor))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Overview</h1>
        <p className="text-muted-foreground mt-2">
          {activeBranch?.address || 'Branch'} - Branch Operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+12.5%</span> vs yesterday
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
              {branchStaff.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {branchStaff.length} total staff
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
              {mockTables.filter(t => t.status === 'occupied').length}/{mockTables.length}
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
              {mockPromotions.filter(p => p.status === 'active').length}
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
                {/* <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Areas</SelectItem>
                  {branchAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      Area {area.name || area.floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

                <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Areas</SelectItem>
                    {branchAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name || `Area ${area.floor}`}
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
                {branchAreas.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Area Status</h4>
                    {branchAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Area {area.name || area.floor}</div>
                          <div className="text-xs text-muted-foreground">Floor {area.floor}</div>
                        </div>
                        <Select
                          value={area.status}
                          onValueChange={(value) => {
                            const { updateArea } = useAreaStore.getState();
                            updateArea(area.id, { status: value as 'active' | 'inactive' | 'unavailable' });
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {filteredTables.map((table) => (
                    <Card
                      key={table.id}
                      className={`border-2 ${table.status === 'available'
                          ? 'border-green-500 bg-green-500/10'
                          : table.status === 'occupied'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-yellow-500 bg-yellow-500/10'
                        }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-bold text-lg">#{table.number}</div>
                        <div className="text-xs text-muted-foreground">
                          Area {table.floor} • {table.capacity} seats
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {table.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
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
              <span className="text-lg font-bold">42</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Average Order Value</span>
              <span className="text-lg font-bold">$67.88</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Total Menu Items Sold</span>
              <span className="text-lg font-bold">342</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
