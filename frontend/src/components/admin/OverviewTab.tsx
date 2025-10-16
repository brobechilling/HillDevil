import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStore } from '@/store/adminStore';
import { usePackageStore } from '@/store/packageStore';
import { mockBranches } from '@/data/mockData';
import { Activity, Database, DollarSign, Eye, Package, Users } from 'lucide-react';

export const OverviewTab = () => {
  const { users, getTotalLandingVisits, getTopSpendingUser, getUsersWithPackages } = useAdminStore();
  const { packages } = usePackageStore();

  const topSpender = getTopSpendingUser();
  const usersWithPackages = getUsersWithPackages();
  const totalPackagesPurchased = users.reduce((sum, user) => sum + user.packagesPurchased.length, 0);

  // Mock system metrics
  const systemMetrics = {
    apiUptime: 99.9,
    avgResponseTime: 45,
    cpuUsage: 32,
    memoryUsage: 58,
  };

  return (
    <div className="space-y-6">
      {/* System Performance */}
      <div>
        <h2 className="text-2xl font-bold mb-4">System Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{systemMetrics.apiUptime}%</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">API requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
              <p className="text-xs text-muted-foreground mt-1">Current load</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
              <p className="text-xs text-muted-foreground mt-1">System memory</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Business Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockBranches.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active branches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Landing Visits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalLandingVisits()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total page visits</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Package Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Package Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Packages Purchased</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPackagesPurchased}</div>
              <p className="text-xs text-muted-foreground mt-1">
                By {usersWithPackages.length} users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Spending User</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {topSpender ? (
                <>
                  <div className="text-2xl font-bold">${topSpender.totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{topSpender.username}</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No purchases yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
