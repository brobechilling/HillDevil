import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';

interface ReportsAnalyticsProps {
  branchId: string;
}

export const ReportsAnalytics = ({ branchId }: ReportsAnalyticsProps) => {
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('day');

  // TODO: Replace with real API calls when backend is ready
  // For now, using mock data for demonstration
  const topItems: any[] = [];

  // Mock data
  const getRevenueData = () => {
    switch (timeframe) {
      case 'day':
        return { total: 2847, growth: 12.5, orders: 38 };
      case 'month':
        return { total: 78420, growth: 18.3, orders: 1247 };
      case 'year':
        return { total: 856340, growth: 24.7, orders: 12847 };
    }
  };

  const data = getRevenueData();

  const mockOrdersByHour = [
    { hour: '9 AM', orders: 5 },
    { hour: '10 AM', orders: 8 },
    { hour: '11 AM', orders: 12 },
    { hour: '12 PM', orders: 18 },
    { hour: '1 PM', orders: 22 },
    { hour: '2 PM', orders: 15 },
    { hour: '3 PM', orders: 10 },
    { hour: '4 PM', orders: 8 },
    { hour: '5 PM', orders: 14 },
    { hour: '6 PM', orders: 25 },
    { hour: '7 PM', orders: 30 },
    { hour: '8 PM', orders: 28 },
  ];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Track your branch performance and insights</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeframe === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('day')}
              >
                Today
              </Button>
              <Button
                variant={timeframe === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('month')}
              >
                Month
              </Button>
              <Button
                variant={timeframe === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('year')}
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ {data.growth}%</span> from last {timeframe}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.orders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 8.2%</span> from last {timeframe}
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
                  ${(data.total / data.orders).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 3.1%</span> from last {timeframe}
                </p>
              </CardContent>
            </Card>
          </div>
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
              <CardDescription>Number of orders by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrdersByHour.map((item) => (
                  <div key={item.hour} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.hour}</span>
                      <span className="text-muted-foreground">{item.orders} orders</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(item.orders / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items (Branch Specific)</CardTitle>
              <CardDescription>Best performing menu items for this branch by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No sales data available for this branch yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} orders</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold">${item.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
