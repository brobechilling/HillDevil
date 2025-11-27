import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reportsApi";
import {
  BranchAnalyticsDTO,
  TopSellingItemDTO,
  OrderDistributionDTO,
} from "@/dto/report.dto";

// Restaurant-level hooks (aggregated from all branches)
export const useRestaurantAnalytics = (
  restaurantId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR'
) => {
  return useQuery<BranchAnalyticsDTO, Error>({
    queryKey: ["restaurant-analytics", restaurantId, timeframe],
    queryFn: () => reportsApi.getRestaurantAnalytics(restaurantId!, timeframe),
    enabled: !!restaurantId,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useRestaurantTopSellingItems = (
  restaurantId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR',
  limit: number = 10
) => {
  return useQuery<TopSellingItemDTO[], Error>({
    queryKey: ["restaurant-top-selling-items", restaurantId, timeframe, limit],
    queryFn: () => reportsApi.getRestaurantTopSellingItems(restaurantId!, timeframe, limit),
    enabled: !!restaurantId,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useRestaurantOrderDistribution = (
  restaurantId: string | undefined,
  date: string
) => {
  return useQuery<OrderDistributionDTO[], Error>({
    queryKey: ["restaurant-order-distribution", restaurantId, date],
    queryFn: () => reportsApi.getRestaurantOrderDistribution(restaurantId!, date),
    enabled: !!restaurantId && !!date,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};

// Branch-level hooks (kept for backward compatibility)
export const useBranchAnalytics = (
  branchId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR'
) => {
  return useQuery<BranchAnalyticsDTO, Error>({
    queryKey: ["branch-analytics", branchId, timeframe],
    queryFn: () => reportsApi.getBranchAnalytics(branchId!, timeframe),
    enabled: !!branchId,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useTopSellingItems = (
  branchId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR',
  limit: number = 10
) => {
  return useQuery<TopSellingItemDTO[], Error>({
    queryKey: ["top-selling-items", branchId, timeframe, limit],
    queryFn: () => reportsApi.getTopSellingItems(branchId!, timeframe, limit),
    enabled: !!branchId,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useOrderDistribution = (
  branchId: string | undefined,
  date: string
) => {
  return useQuery<OrderDistributionDTO[], Error>({
    queryKey: ["order-distribution", branchId, date],
    queryFn: () => reportsApi.getOrderDistribution(branchId!, date),
    enabled: !!branchId && !!date,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
};
