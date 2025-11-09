import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/api/subscriptionApi";
import { SubscriptionResponse } from "@/dto/subscription.dto";

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => subscriptionApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

export const useActiveSubscriptionByRestaurant = (restaurantId: string) => {
  return useQuery<SubscriptionResponse | null, Error>({
    queryKey: ["subscriptions", "active", restaurantId],
    queryFn: () => subscriptionApi.getActiveByRestaurant(restaurantId),
    enabled: !!restaurantId
    ,staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

export const useOverviewForOwner = () => {
  return useQuery({
    queryKey: ["subscriptions", "overview"],
    queryFn: () => subscriptionApi.getOverviewForOwner(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// 🔹 Lấy payment history theo restaurant
export const usePaymentHistory = (restaurantId: string) => {
  return useQuery({
    queryKey: ["subscriptions", "payments", restaurantId],
    queryFn: () => subscriptionApi.getPaymentHistory(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useLatestPaymentStatus = (restaurantId: string) => {
  return useQuery({
    queryKey: ["subscriptions", "latest-payment", restaurantId],
    queryFn: () => subscriptionApi.getLatestPaymentStatus(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: ["subscriptions", "stats"],
    queryFn: () => subscriptionApi.getStats(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useActivateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, durationMonths }: { id: string; durationMonths: number }) =>
      subscriptionApi.activate(id, durationMonths),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["subscriptions", variables.id] });
      qc.invalidateQueries({ queryKey: ["subscriptions", "active"] });
    },
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, additionalMonths }: { id: string; additionalMonths: number }) =>
      subscriptionApi.renew(id, additionalMonths),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["subscriptions", variables.id] });
      qc.invalidateQueries({ queryKey: ["subscriptions", "active"] });
    },
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionApi.cancel(subscriptionId),
    onSuccess: (_, subscriptionId) => {
      qc.invalidateQueries({ queryKey: ["subscriptions", subscriptionId] });
      qc.invalidateQueries({ queryKey: ["subscriptions", "overview"] });
    },
  });
};

export const useChangePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      restaurantId,
      newPackageId,
    }: {
      restaurantId: string;
      newPackageId: string;
    }) => subscriptionApi.changePackage(restaurantId, newPackageId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "active", variables.restaurantId] });
      qc.invalidateQueries({ queryKey: ["subscriptions", "overview"] });
    },
  });
};

export const useAllSubscriptionsByRestaurant = (restaurantId: string) => {
  return useQuery<SubscriptionResponse[], Error>({
    queryKey: ['subscriptions', 'all', restaurantId],
    queryFn: () => subscriptionApi.getAllByRestaurant(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};