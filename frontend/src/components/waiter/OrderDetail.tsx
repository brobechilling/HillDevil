import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderDTO, OrderStatus } from "@/dto/order.dto";
import { useUpdateOrderStatuss } from "@/hooks/queries/useOrders";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: OrderDTO;
  branchId: string;
}

export const OrderDetail = ({ open, onOpenChange, order, branchId }: Props) => {
  const updateStatusMutation = useUpdateOrderStatuss(branchId);

  const updateStatus = (newStatus: OrderStatus) => {
    updateStatusMutation.mutate({
      orderId: order.orderId,
      orderStatus: newStatus,
    });
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Order - {order.tableTag} ({order.areaName})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {order.orderLines.map((line) => (
            <Card key={line.orderLineId} className="p-4 space-y-2 border">
              <div className="flex justify-between font-medium">
                <span>OrderLine:</span>
                <span>{line.orderLineStatus}</span>
              </div>

              {line.orderItems.map((item) => (
                <div key={item.orderItemId} className="ml-3 border-l pl-3 py-1">
                  <div className="flex justify-between">
                    <span>
                      {item.quantity} × {item.menuItemName}
                    </span>
                    <span>{item.totalPrice.toLocaleString()} VND</span>
                  </div>

                  {item.customizations.length > 0 && (
                    <div className="ml-6 text-sm text-muted-foreground">
                      {item.customizations.map((c) => (
                        <div
                          key={c.orderItemCustomizationId}
                          className="flex justify-between"
                        >
                          <span>
                            + {c.quantity} {c.customizationName}
                          </span>
                          <span>+{c.totalPrice.toLocaleString()} VND</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <div className="ml-6 text-xs italic text-muted-foreground">
                      Note: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          ))}
        </div>

        {order.status === OrderStatus.EATING && (
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => updateStatus(OrderStatus.COMPLETED)}
            >
              Mark Completed
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => updateStatus(OrderStatus.CANCELLED)}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
