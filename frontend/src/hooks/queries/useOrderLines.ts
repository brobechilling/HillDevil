import { createOrderLine, getCancelledOrderLineByBranch, getCompletedOrderLineByBranch, getPendingOrderLineByBranch, getPreparingOrderLineByBranch, udpateOrderLineStatus } from "@/api/orderLineApi"
import { OrderLineDTO, OrderLineStatus } from "@/dto/orderLine.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useCreateOrderLine = () => {
  return useMutation({
    mutationFn: createOrderLine,
  });
};

// export const useGetPendingOrderLine = (branchId: string) => {
//     return useQuery<OrderLineDTO[]>({
//         queryKey: ['branches', branchId, 'pending'],
//         queryFn: () => getPendingOrderLineByBranch(branchId),
//     });
// };

// export const useGetPreparingOrderLine = (branchId: string) => {
//     return useQuery<OrderLineDTO[]>({
//         queryKey: ['branches', branchId, 'preparing'],
//         queryFn: () => getPreparingOrderLineByBranch(branchId),
//     });
// };

// export const useGetCompletedOrderLine = (branchId: string) => {
//     return useQuery<OrderLineDTO[]>({
//         queryKey: ['branches', branchId, 'completed'],
//         queryFn: () => getCompletedOrderLineByBranch(branchId),
//     });
// };

// export const useGetCancelledOrderLine = (branchId: string) => {
//     return useQuery<OrderLineDTO[]>({
//         queryKey: ['branches', branchId, 'cancelled'],
//         queryFn: () => getCancelledOrderLineByBranch(branchId),
//     });
// };

export const useOrderLinesByStatus = (
  branchId: string,
  status: OrderLineStatus,
  fetcher: (branchId: string) => Promise<OrderLineDTO[]>
) => {
  return useQuery<OrderLineDTO[]>({
    queryKey: ['orderLines', branchId, status],
    queryFn: () => fetcher(branchId),
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
      if (data.isSuccessful) {
        queryClient.invalidateQueries({queryKey: ['orderLines', branchId, data.previousStatus]});
        queryClient.invalidateQueries({queryKey: ['orderLines', branchId, data.newStatus]});
      }
    },
  });
};
