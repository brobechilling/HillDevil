import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowUp,
  Plus,
  AlertCircle
} from 'lucide-react';
import { BranchManagementCard } from './BranchManagementCard';
import { BranchManagementDialog } from './BranchManagementDialog';
import { useCanCreateBranch } from '@/hooks/queries/useBranches';
import { useRestaurantBranchPerformance, useRestaurantAnalytics } from '@/hooks/queries/useBranchReports';
import { useNavigate} from 'react-router-dom';

interface OverviewDashboardProps {
  userBranches: any[];
  onBranchUpdate: () => void;
}

export const OverviewDashboard = ({ userBranches, onBranchUpdate }: OverviewDashboardProps) => {
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const canCreateBranchQuery = useCanCreateBranch(selectedRestaurant?.restaurantId);
  const { data: branchPerformance, isLoading: isLoadingPerformance } = useRestaurantBranchPerformance(
    selectedRestaurant?.restaurantId,
    reportType
  );
  const { data: restaurantStats, isLoading: isLoadingStats } = useRestaurantAnalytics(
    selectedRestaurant?.restaurantId,
    reportType
  );
  const navigate = useNavigate();

  const isLoading = isLoadingPerformance || isLoadingStats;

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
              <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
              onClick={() => navigate('/profile/subscription')}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {restaurantStats?.totalRevenue.toLocaleString()} VND
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all branches
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {restaurantStats?.totalOrders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {restaurantStats?.completedOrders} completed, {restaurantStats?.cancelledOrders} cancelled
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {restaurantStats?.avgOrderValue.toLocaleString()} VND
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per completed order
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <div id="branch-management">
        <BranchManagementCard
          branches={userBranches}
          onUpdate={() => onBranchUpdate?.()}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branch Performance</CardTitle>
              <CardDescription>Revenue by branch location</CardDescription>
            </div>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="DAY">Daily</SelectItem>
                <SelectItem value="MONTH">Monthly</SelectItem>
                <SelectItem value="YEAR">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPerformance ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : branchPerformance && branchPerformance.length > 0 ? (
            <div className="space-y-4">
              {branchPerformance.map((branch) => (
                <div key={branch.branchId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{branch.branchName}</span>
                    <span className="text-muted-foreground">
                      ${branch.totalRevenue.toLocaleString()} ({branch.percentage.toFixed(1)}%)
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No branch performance data available
            </div>
          )}
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
