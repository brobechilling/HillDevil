import { deleteOrderItem, updateOrderItem } from "@/api/orderItemApi"
import { OrderStatus } from "@/dto/order.dto";
import { OrderLineStatus } from "@/dto/orderLine.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query"


export const useUpdateOrderItem = (branchId: string, activeTab: OrderLineStatus) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrderItem,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['orderLines', branchId, activeTab],
                refetchType: 'active',
            });
            queryClient.invalidateQueries({
                queryKey: ['orders', branchId, OrderStatus.EATING],
                refetchType: 'active',
            });
        }
    });
};

export const useDeleteOrderItem = (branchId: string, activeTab: OrderLineStatus) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteOrderItem,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['orderLines', branchId, activeTab],
                refetchType: 'active',
            });
        }
    })
};