import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BranchManagementCard } from './BranchManagementCard';
import { BranchManagementDialog } from './BranchManagementDialog';
import { useCanCreateBranch } from '@/hooks/queries/useBranches';

interface OverviewDashboardProps {
  userBranches: any[];
  onBranchUpdate: () => void;
}

export const OverviewDashboard = ({ userBranches, onBranchUpdate }: OverviewDashboardProps) => {
  const [stats, setStats] = useState<any>(null);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const canCreateBranchQuery = useCanCreateBranch(selectedRestaurant?.restaurantId);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // const statsResponse = await statsApi.getOwnerStats();
        // setStats(statsResponse.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: 'Could not load dashboard data.',
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground mt-2">
              Your restaurant performance at a glance
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setBranchDialogOpen(true)}
              disabled={!canCreateBranchQuery.data}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Branch
            </Button>
          </div>
        </div>

        {!canCreateBranchQuery.data && (
          <Card className="border-amber-500">
            <CardContent className="pt-6 pb-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-500 mb-1">Branch Creation Limit Reached</h4>
                <p className="text-sm text-muted-foreground">
                  You've reached the maximum number of branches for your current package. 
                  Please upgrade to Premium to create more branches and unlock additional features.
                </p>
              </div>
              <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{stats?.revenueGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{stats?.ordersGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{stats?.customerGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgOrderValue}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Menu Items</CardTitle>
          <CardDescription>Top performing items across all branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bestSellers.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(Math.random() * 100 + 50)} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Branch Performance */}
      <BranchManagementCard
        branches={userBranches}
        onUpdate={() => onBranchUpdate?.()}
      />

      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>Revenue by branch location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.branchPerformance.map((branch: any) => (
              <div key={branch.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-muted-foreground">
                    ${branch.revenue.toLocaleString()} ({branch.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary"
                    style={{ width: `${branch.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <BranchManagementDialog
        open={branchDialogOpen}
        onOpenChange={setBranchDialogOpen}
        onSave={onBranchUpdate}
      />
    </div>
  );
};
