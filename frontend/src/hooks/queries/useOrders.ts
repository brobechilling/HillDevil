import { getCompletedOrderByBranch, getEatingOrderByBranch, setOrderStatus } from "@/api/orderApi";
import { OrderDTO, OrderStatus } from "@/dto/order.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrderByStatus = (branchId: string, status: OrderStatus, fetcher: (branchId: string) => Promise<OrderDTO[]>) => {
    return useQuery<OrderDTO[]>({
        queryKey: ['orders', branchId, status],
        queryFn: () => fetcher(branchId),
        staleTime: 5 * 60 * 1000,    
    });
};

export const useGetEatingOrder = (branchId: string) => useOrderByStatus(branchId, OrderStatus.EATING, getEatingOrderByBranch);

export const useGetCompletedOrder = (branchId: string) => useOrderByStatus(branchId, OrderStatus.COMPLETED, getCompletedOrderByBranch);

export const useUpdateOrderStatuss = (branchId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setOrderStatus,
        onSuccess: (data) => {
            if (data.successful) {
                queryClient.invalidateQueries({
                    queryKey: ['orders', branchId, data.previousStatus],
                    refetchType: 'active',
                });
                queryClient.invalidateQueries({
                    queryKey: ['orders', branchId, data.newStatus],
                    refetchType: 'active',
                });
            }
        } 
    })
};
