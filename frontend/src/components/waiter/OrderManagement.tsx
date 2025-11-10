import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrderStore, Order } from '@/store/orderStore';
import { toast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';

export const OrderManagement = () => {
  const { user } = useSessionStore(); 
  const branchId = isStaffAccountDTO(user) ? user.branchId : "";
  const allOrders = useOrderStore((state) => state.orders);
  const orders = allOrders.filter(o => o.branchId === branchId);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const currentOrders = orders.filter(o => !o.billed);
  const pastOrders = orders.filter(o => o.billed);

  const filterOrders = (orderList: Order[]) => {
    return orderList.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = !searchQuery || 
        (order.tableNumber && order.tableNumber.toString().includes(searchQuery)) ||
        order.orderLines.some(line => 
          line.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          line.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesDate = !dateFilter || 
        new Date(order.createdAt).toISOString().split('T')[0] === dateFilter;

      return matchesStatus && matchesSearch && matchesDate;
    });
  };

  const filteredCurrentOrders = filterOrders(currentOrders);
  const filteredPastOrders = filterOrders(pastOrders);

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      preparing: 'secondary',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    toast({
      title: 'Order Updated',
      description: `Order status changed to ${newStatus}`,
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg">Order #{order.id}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Table {order.tableNumber} • {new Date(order.createdAt).toLocaleTimeString()}
            </p>
            {order.billed && order.billedAt && (
              <p className="text-xs text-muted-foreground">
                Billed: {new Date(order.billedAt).toLocaleString()}
              </p>
            )}
          </div>
          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
        </div>

        <div className="space-y-3 mb-4">
          {order.orderLines.map((line, lineIdx) => (
            <div key={line.id} className="space-y-2 p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">
                Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
              </div>
              {line.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {line.notes && (
                <p className="text-xs text-muted-foreground italic">
                  Note: {line.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {!order.billed && (
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(order.id, 'preparing')}
              >
                Start Preparing
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(order.id, 'ready')}
              >
                Mark as Ready
              </Button>
            )}
            {order.status === 'ready' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(order.id, 'completed')}
              >
                Complete Order
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!branchId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Branch not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>View and manage all orders</CardDescription>

        <div className="grid gap-4 md:grid-cols-3 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              Current Orders ({filteredCurrentOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Past Order History ({filteredPastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {filteredCurrentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No current orders found
              </p>
            ) : (
              filteredCurrentOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {filteredPastOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No past orders found
              </p>
            ) : (
              filteredPastOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
