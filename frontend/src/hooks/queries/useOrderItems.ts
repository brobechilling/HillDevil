import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateOrderItemRequest } from '../../dto/orderItem.dto';
import orderItemApi from '../../api/orderItemApi';

export const useCreateOrderItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderLineId, items }: { orderLineId: string; items: CreateOrderItemRequest[] }) =>
      orderItemApi.createItems(orderLineId, items),
    onSuccess: (_, { orderLineId }) => {
      queryClient.invalidateQueries({
        queryKey: ['orderLines', orderLineId],
      });
    },
  });
};
