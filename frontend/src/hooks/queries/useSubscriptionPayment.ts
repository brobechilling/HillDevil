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
    refetchInterval: (query) => {
      // ✅ Chỉ polling khi status là PENDING
      const data = query.state.data;
      if (data?.subscriptionPaymentStatus && data.subscriptionPaymentStatus !== "PENDING") {
        return false; // Stop polling
      }
      return 3000; // Poll every 3 seconds
    },
    refetchIntervalInBackground: true, // Continue polling when tab is in background
  });
};

export const useCancelPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderCode: string) => subscriptionPaymentApi.cancel(orderCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-status"] }),
  });
};
