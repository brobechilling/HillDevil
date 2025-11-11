import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePackages } from '@/hooks/queries/usePackages';
import { useRestaurants } from '@/hooks/queries/useRestaurants';
import { useGetTop5SpendingUsers } from '@/hooks/queries/useSubscriptionPayment';
import { useAllUsers } from '@/hooks/queries/useUsers';
import { Activity, Database, Eye, Package, Users, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const OverviewTab = () => {
  const { data: packages = [], isLoading: packagesLoading } = usePackages();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: topSpenders = [], isLoading: spendersLoading } = useGetTop5SpendingUsers();

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
              <div className="text-2xl font-bold">
                {usersLoading ? '...' : allUsers.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurantsLoading ? '...' : restaurants.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active restaurants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {packagesLoading ? '...' : packages.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available packages</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Spending Users */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Spending Users</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Users by Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {spendersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : topSpenders && topSpenders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSpenders.map((user, index) => (
                    <TableRow key={user.userId || index}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {typeof user.totalSpent === 'number' ? user.totalSpent.toFixed(2) : '0.00'}VND
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No spending data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
