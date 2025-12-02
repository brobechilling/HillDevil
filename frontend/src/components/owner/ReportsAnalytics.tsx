import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { useRestaurantAnalytics, useRestaurantTopSellingItems, useRestaurantOrderDistribution } from '@/hooks/queries/useReports';
import LoadingSkeleton, { Skeleton } from '@/components/common/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportsAnalyticsProps {
  restaurantId: string;
}

export const ReportsAnalytics = ({ restaurantId }: ReportsAnalyticsProps) => {
  const [timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
  
  // Get current date for order distribution
  const currentDate = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }, []);

  // Fetch data using React Query hooks
  const { 
    data: analytics, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useRestaurantAnalytics(restaurantId, timeframe);
  
  const { 
    data: topItems, 
    isLoading: topItemsLoading, 
    error: topItemsError 
  } = useRestaurantTopSellingItems(restaurantId, timeframe, 10);
  
  const { 
    data: orderDistribution, 
    isLoading: distributionLoading, 
    error: distributionError 
  } = useRestaurantOrderDistribution(restaurantId, currentDate);



  // Format hour for display (0-23 to 12-hour format)
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Calculate max order count for progress bar scaling
  const maxOrderCount = useMemo(() => {
    if (!orderDistribution || orderDistribution.length === 0) return 1;
    return Math.max(...orderDistribution.map(d => d.orderCount), 1);
  }, [orderDistribution]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Track your restaurant performance across all branches</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeframe === 'DAY' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('DAY')}
              >
                Today
              </Button>
              <Button
                variant={timeframe === 'MONTH' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('MONTH')}
              >
                Month
              </Button>
              <Button
                variant={timeframe === 'YEAR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('YEAR')}
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analyticsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load analytics data. Please try again later.
              </AlertDescription>
            </Alert>
          ) : analyticsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString()} VND </div>
                  {/* <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 12.5%</span> from last period
                  </p> */}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.completedOrders} completed, {analytics.cancelledOrders} cancelled
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.avgOrderValue.toLocaleString()} VND
                  </div>
                  {/* <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 3.1%</span> from last period
                  </p> */}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No analytics data available for this restaurant.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders by Time</TabsTrigger>
          <TabsTrigger value="items">Top Selling Items</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Distribution</CardTitle>
              <CardDescription>Number of orders by hour of day (today)</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load order distribution data. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : distributionLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : orderDistribution && orderDistribution.length > 0 ? (
                <div className="space-y-4">
                  {orderDistribution.map((item) => (
                    <div key={item.hour} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{formatHour(item.hour)}</span>
                        <span className="text-muted-foreground">
                          {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(item.orderCount / maxOrderCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No orders recorded for today yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing menu items by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topItemsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load top selling items. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : topItemsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : topItems && topItems.length > 0 ? (
                <div className="space-y-6">
                  {topItems.map((item, index) => (
                    <div key={item.menuItemId} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.menuItemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantitySold} {item.quantitySold === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold">{item.totalRevenue.toLocaleString()} VND</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sales data available for this restaurant yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
