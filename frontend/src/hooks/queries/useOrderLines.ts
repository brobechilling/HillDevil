import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderLineDTO, OrderLineStatus } from '../../dto/orderLine.dto';
import orderLineApi from '../../api/orderLineApi';

export const useOrderLine = (id: string) => {
  return useQuery({
    queryKey: ['orderLines', id],
    queryFn: () => orderLineApi.getById(id),
    enabled: !!id,
  });
};

export const useOrderLinesByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orderLines', 'order', orderId],
    queryFn: () => orderLineApi.getByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useUpdateOrderLineStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderLineId, status }: { orderLineId: string; status: OrderLineStatus }) =>
      orderLineApi.updateStatus(orderLineId, status),
    onSuccess: (_, { orderLineId }) => {
      queryClient.invalidateQueries({
        queryKey: ['orderLines', orderLineId],
      });
    },
  });
};
