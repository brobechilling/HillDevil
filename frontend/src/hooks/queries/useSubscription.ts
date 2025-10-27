import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/api/subscriptionApi";
import { SubscriptionRequest } from "@/dto/subscription.dto";

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: (data: SubscriptionRequest) => subscriptionApi.create(data),
    onError: (error) => {
      console.error("Create subscription failed:", error.message);
    },
  });
};

export const useActivateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, durationMonths }: { id: string; durationMonths: number }) =>
      subscriptionApi.activate(id, durationMonths),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, months }: { id: string; months: number }) =>
      subscriptionApi.renew(id, months),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  });
};
