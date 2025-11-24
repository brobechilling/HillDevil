import { createOrderLine, getCancelledOrderLineByBranch, getCompletedOrderLineByBranch, getPendingOrderLineByBranch, getPreparingOrderLineByBranch, udpateOrderLineStatus } from "@/api/orderLineApi"
import { OrderStatus } from "@/dto/order.dto";
import { OrderLineDTO, OrderLineStatus } from "@/dto/orderLine.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useCreateOrderLine = () => {
  return useMutation({
    mutationFn: createOrderLine,
  });
};

export const useOrderLinesByStatus = (
  branchId: string,
  status: OrderLineStatus,
  fetcher: (branchId: string) => Promise<OrderLineDTO[]>
) => {
  return useQuery<OrderLineDTO[]>({
    queryKey: ['orderLines', branchId, status],
    queryFn: () => fetcher(branchId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPendingOrderLine = (branchId: string) =>
  useOrderLinesByStatus(branchId, OrderLineStatus.PENDING, getPendingOrderLineByBranch);

export const useGetPreparingOrderLine = (branchId: string) =>
  useOrderLinesByStatus(branchId, OrderLineStatus.PREPARING, getPreparingOrderLineByBranch);

export const useGetCompletedOrderLine = (branchId: string) =>
  useOrderLinesByStatus(branchId, OrderLineStatus.COMPLETED, getCompletedOrderLineByBranch);

export const useGetCancelledOrderLine = (branchId: string) =>
  useOrderLinesByStatus(branchId, OrderLineStatus.CANCELLED, getCancelledOrderLineByBranch);


export const useUpdateOrderLineStatus = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: udpateOrderLineStatus,
    onSuccess: (data) => {
      if (data.successful) {
        queryClient.invalidateQueries({
          queryKey: ['orderLines', branchId, data.previousStatus],
          refetchType: 'active',
        });
        queryClient.invalidateQueries({
          queryKey: ['orderLines', branchId, data.newStatus],
          refetchType: 'active',
        });
        queryClient.invalidateQueries({
          queryKey: ['orders', branchId, OrderStatus.EATING],
          refetchType: 'active',
        });
      }
    },
  });
};
