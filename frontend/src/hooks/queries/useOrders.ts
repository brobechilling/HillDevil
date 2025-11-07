import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderDTO, CreateOrderRequest } from '../../dto/order.dto';
import orderApi from '../../api/orderApi';

export const useOrdersHistory = (branchId: string) => {
  return useQuery({
    queryKey: ['orders', 'history', branchId],
    queryFn: () => orderApi.getOrdersHistory(branchId),
    enabled: !!branchId,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderApi.getById(orderId),
    enabled: !!orderId,
  });
};

export const usePendingOrderByTable = (tableId: string) => {
  return useQuery({
    queryKey: ['orders', 'pending', tableId],
    queryFn: () => orderApi.getPendingByTable(tableId),
    enabled: !!tableId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => orderApi.create(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({
        queryKey: ['orders', 'pending', request.areaTableId],
      });
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderApi.completeOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] });
    },
  });
};
