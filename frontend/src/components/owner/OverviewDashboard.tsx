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
  Copy,
  ExternalLink,
  Plus
} from 'lucide-react';
import { statsApi, menuApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
import { BranchManagementCard } from './BranchManagementCard';
import { BranchManagementDialog } from './BranchManagementDialog';
import { RestaurantCreationDialog } from './RestaurantCreationDialog';

interface OverviewDashboardProps {
  userBranches: any[];
  onBranchUpdate?: () => void;
}

export const OverviewDashboard = ({ userBranches, onBranchUpdate }: OverviewDashboardProps) => {
  const [stats, setStats] = useState<any>(null);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const statsResponse = await statsApi.getOwnerStats();
        setStats(statsResponse.data);
        const menuResponse = await menuApi.getAll();
        setBestSellers(menuResponse.data.filter((item: any) => item.bestSeller).slice(0, 5));
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

  const getBranchUrl = (branch: any) => {
    return `${window.location.origin}/branch/${branch.shortCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'URL copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-2">
            Your restaurant performance at a glance
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => setRestaurantDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Restaurant
          </Button> */}
          <Button onClick={() => setBranchDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Branch
          </Button>
        </div>
      </div>

      {/* Branch QR Code Section */}
      {userBranches && userBranches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Branch Public Links & QR Codes</CardTitle>
            <CardDescription>
              Share these links or QR codes with your customers to access your branch menus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 w-full">
              {userBranches.map((branch: any) => (
                <div key={branch.id} className="flex flex-row items-center gap-4 w-full p-4 border rounded-lg bg-muted/50 min-h-[100px]">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <QRCodeSVG value={getBranchUrl(branch)} size={80} className="border bg-white rounded-md p-1" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono text-sm break-all bg-white px-2 py-1 rounded border flex-1 min-w-0 max-w-full">{getBranchUrl(branch)}</span>
                      <Button size="icon" variant="ghost" className="ml-1" title="Open in new tab" onClick={() => window.open(getBranchUrl(branch), '_blank')}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="ml-1" title="Copy URL" onClick={() => copyToClipboard(getBranchUrl(branch))}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{branch.name} - {branch.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
        onSave={() => {
          onBranchUpdate?.();
        }}
      />

      <RestaurantCreationDialog
        open={restaurantDialogOpen}
        onOpenChange={setRestaurantDialogOpen}
        onSave={() => {
          onBranchUpdate?.();
        }}
      />
    </div>
  );
};
