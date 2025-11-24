import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isStaffAccountDTO } from "@/utils/typeCast";
import { useSessionStore } from "@/store/sessionStore";
import { useGetEatingOrder, useGetCompletedOrder, useGetCancelledOrder } from "@/hooks/queries/useOrders";
import { OrderStatus, OrderDTO } from "@/dto/order.dto";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetail } from "@/components/waiter/OrderDetail";

const OrderHistoryPage = () => {
  const { user } = useSessionStore();
  const branchId = isStaffAccountDTO(user) ? user.branchId : "";

  const [activeTab, setActiveTab] = useState(OrderStatus.EATING);
  const [search, setSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");


  // dialog state
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const eatingQuery = useGetEatingOrder(branchId);
  const completedQuery = useGetCompletedOrder(branchId);
  const cancelledQuery = useGetCancelledOrder(branchId);

  const filterList = (orders?: OrderDTO[]) => {
    if (!orders) return [];
    let list = orders;

    // text search filter
    if (search.trim()) {
        const keyword = search.toLowerCase();
        list = list.filter(
        (o) =>
            o.tableTag.toLowerCase().includes(keyword) ||
            o.areaName.toLowerCase().includes(keyword)
        );
    }

    // date filter
    if (fromDate) {
        const from = new Date(fromDate).getTime();
        list = list.filter((o) => new Date(o.createdAt).getTime() >= from);
    }

    if (toDate) {
        const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000; // include full day
        list = list.filter((o) => new Date(o.createdAt).getTime() <= to);
    }

    return list;
  };

  const renderLoading = () => (
    <Card>
      <CardContent className="py-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );

  const renderOrderCard = (order: OrderDTO) => (
    <Card key={order.orderId} className="space-y-3">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {order.tableTag} - {order.areaName}
          </CardTitle>

          <Badge>{order.status}</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Created: {new Date(order.createdAt).toLocaleString()}
          <br />
          Last order: {new Date(order.updatedAt).toLocaleString()}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between font-semibold mb-3">
          <span>Total</span>
          <span>{order.totalPrice.toLocaleString()} VND</span>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            setSelectedOrder(order);
            setIsDialogOpen(true);
          }}
        >
          View Detail
        </Button>
      </CardContent>
    </Card>
  );

  const getList = () => {
    switch (activeTab) {
      case OrderStatus.EATING:
        return filterList(eatingQuery.data);
      case OrderStatus.COMPLETED:
        return filterList(completedQuery.data);
      case OrderStatus.CANCELLED:
        return filterList(cancelledQuery.data);
      default:
        return [];
    }
  };

  const currentQuery =
    activeTab === OrderStatus.EATING
      ? eatingQuery
      : activeTab === OrderStatus.COMPLETED
      ? completedQuery
      : cancelledQuery;

  const filteredList = getList();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Order History</h2>

      <Input
        placeholder="Search by table or area..."
        className="max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-4 max-w-md">
        <div className="flex flex-col w-full">
            <label className="text-xs text-muted-foreground mb-1">From date</label>
            <Input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
            />
        </div>

        <div className="flex flex-col w-full">
            <label className="text-xs text-muted-foreground mb-1">To date</label>
            <Input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            />
        </div>
      </div>



      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
        <TabsList>
          <TabsTrigger value={OrderStatus.EATING}>Eating</TabsTrigger>
          <TabsTrigger value={OrderStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={OrderStatus.CANCELLED}>Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {currentQuery.isLoading && renderLoading()}

          {!currentQuery.isLoading &&
            filteredList.map((order) => renderOrderCard(order))}

          {!currentQuery.isLoading && filteredList.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No {activeTab.toLowerCase()} orders.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <OrderDetail
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          order={selectedOrder}
          branchId={branchId}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;
