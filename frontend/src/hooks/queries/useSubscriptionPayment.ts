import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionPaymentApi } from "@/api/subscriptionPaymentApi";

export const useCreateSubscriptionPayment = () => {
  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionPaymentApi.create(subscriptionId),
  });
};

export const usePaymentStatus = (orderCode: string) => {
  return useQuery({
    queryKey: ["payment-status", orderCode],
    queryFn: () => subscriptionPaymentApi.getStatus(orderCode),
    enabled: !!orderCode,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useCancelPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderCode: string) => subscriptionPaymentApi.cancel(orderCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-status"] }),
  });
};
