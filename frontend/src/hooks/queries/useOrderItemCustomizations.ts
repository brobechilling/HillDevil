import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateOrderItemCustomizationRequest } from '../../dto/orderItemCustomization.dto';
import orderItemCustomizationApi from '../../api/orderItemCustomizationApi';

export const useCreateOrderItemCustomizations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderItemId,
      customizations,
    }: {
      orderItemId: string;
      customizations: CreateOrderItemCustomizationRequest[];
    }) => orderItemCustomizationApi.createCustomizations(orderItemId, customizations),
    onSuccess: (_, { orderItemId }) => {
      queryClient.invalidateQueries({
        queryKey: ['orderItems', orderItemId],
      });
    },
  });
};
