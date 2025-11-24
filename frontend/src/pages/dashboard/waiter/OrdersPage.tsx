import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/store/sessionStore";
import { isStaffAccountDTO } from "@/utils/typeCast";

import {
  useGetPendingOrderLine,
  useGetPreparingOrderLine,
  useGetCompletedOrderLine,
  useGetCancelledOrderLine,
  useUpdateOrderLineStatus,
} from "@/hooks/queries/useOrderLines";
import { OrderLineDTO, OrderLineStatus } from "@/dto/orderLine.dto";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderItemDTO } from "@/dto/orderItem.dto";
import { OrderLineEditDialog } from "@/components/waiter/OrderLineEditDialog";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";


const OrdersPage = () => {
  const { user } = useSessionStore();
  const branchId = isStaffAccountDTO(user) ? user.branchId : "";

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");

  const pendingQuery = useGetPendingOrderLine(branchId);
  const preparingQuery = useGetPreparingOrderLine(branchId);
  const completedQuery = useGetCompletedOrderLine(branchId);
  const cancelledQuery = useGetCancelledOrderLine(branchId);

  const updateStatusMutation = useUpdateOrderLineStatus(branchId);

  const handleUpdateStatus = (orderLineId: string, newStatus: OrderLineStatus) => {
    updateStatusMutation.mutate({ orderLineId, orderLineStatus: newStatus });
  };

  // dialog state
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItemDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: OrderLineStatus) => {
    const variants: Record<OrderLineStatus, any> = {
      PENDING: "secondary",
      PREPARING: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filterBySearch = (list?: OrderLineDTO[]) => {
    if (!list) return [];
    if (!search.trim()) return list;

    const keyword = search.toLowerCase();
    return list.filter(
      (o) => o.tableTag.toLowerCase().includes(keyword) || o.areaName.toLowerCase().includes(keyword)
    );
  };

  const filteredList = useMemo(() => {
    switch (activeTab) {
      case "PENDING":
        return filterBySearch(pendingQuery.data);
      case "PREPARING":
        return filterBySearch(preparingQuery.data);
      case "COMPLETED":
        return filterBySearch(completedQuery.data);
      case "CANCELLED":
        return filterBySearch(cancelledQuery.data);
      default:
        return [];
    }
  }, [activeTab, search, pendingQuery.data, preparingQuery.data, completedQuery.data, cancelledQuery.data]);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], 
      query: { branchId },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    newSocket.on("create_orderLine", (newOrderLine: OrderLineDTO) => {
      if (newOrderLine.orderLineStatus !== OrderLineStatus.PENDING) 
        return;
      
      const key = ['orderLines', branchId, OrderLineStatus.PENDING];

      queryClient.setQueryData<OrderLineDTO[]>(key, (oldList) => {
        if (!oldList) 
          return [newOrderLine];
        const exists = oldList.some(
          (o) => o.orderLineId === newOrderLine.orderLineId
        );
        if (exists) 
          return oldList;
        return [newOrderLine, ...oldList];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const renderLoading = () => (
    <Card>
      <CardContent className="py-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );

  const renderOrderCard = (order: OrderLineDTO) => (
    <Card key={order.orderLineId} className="space-y-3">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {order.tableTag} - {order.areaName}
          </CardTitle>
          {getStatusBadge(order.orderLineStatus)}
        </div>

        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</div>
      </CardHeader>

      <CardContent className="space-y-3">
        {order.orderItems
          .filter((item) => item.status)
          .map((item) => (
            <div key={item.orderItemId} className="p-3 bg-muted/20 rounded border space-y-1">
              <div className="flex justify-between font-medium text-sm">
                <span>
                  {item.quantity} {item.menuItemName}
                </span>
                <span>{item.totalPrice.toLocaleString()} VND</span>
              </div>

              {item.customizations.length > 0 && (
                <div className="ml-4 text-xs text-muted-foreground space-y-0.5">
                  {item.customizations.map((c) => (
                    <div key={c.orderItemCustomizationId} className="flex justify-between">
                      <span>+ {c.quantity} {c.customizationName}</span>
                      <span>+{c.totalPrice.toLocaleString()} VND</span>
                    </div>
                  ))}
                </div>
              )}

              {item.note && (
                <div className="text-xs italic text-muted-foreground border-t pt-1">Note: {item.note}</div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {(order.orderLineStatus === OrderLineStatus.PENDING || order.orderLineStatus === OrderLineStatus.PREPARING) && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrderItem(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}

        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>{order.totalPrice.toLocaleString()} VND</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {order.orderLineStatus === OrderLineStatus.PENDING && (
            <>
              <Button
                className="flex-1"
                onClick={() =>
                  handleUpdateStatus(order.orderLineId, OrderLineStatus.PREPARING)
                }
              >
                Accept
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() =>
                  handleUpdateStatus(order.orderLineId, OrderLineStatus.CANCELLED)
                }
              >
                Reject
              </Button>
            </>
          )}

          {order.orderLineStatus === OrderLineStatus.PREPARING && (
            <>
              <Button
                className="flex-1"
                onClick={() =>
                  handleUpdateStatus(order.orderLineId, OrderLineStatus.COMPLETED)
                }
              >
                Complete
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() =>
                  handleUpdateStatus(order.orderLineId, OrderLineStatus.CANCELLED)
                }
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Order Management</h2>

      <Input placeholder="Search by table or area..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending ({pendingQuery.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="PREPARING">Preparing ({preparingQuery.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed ({completedQuery.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled ({cancelledQuery.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        {["PENDING", "PREPARING", "COMPLETED", "CANCELLED"].map((tab) => {
          const query =
            tab === "PENDING"
              ? pendingQuery
              : tab === "PREPARING"
              ? preparingQuery
              : tab === "COMPLETED"
              ? completedQuery
              : cancelledQuery;

          return (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
              {query.isLoading && renderLoading()}

              {activeTab === tab && filteredList.map((order) => renderOrderCard(order))}

              {!query.isLoading && activeTab === tab && filteredList.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No {tab.toLowerCase()} orders.</CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dialog for editing an order item */}
      {selectedOrderItem && (
        <OrderLineEditDialog
          orderItem={selectedOrderItem}
          open={isDialogOpen}
          onOpenChange={(v) => setIsDialogOpen(v)}
          branchId={branchId}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

export default OrdersPage;
