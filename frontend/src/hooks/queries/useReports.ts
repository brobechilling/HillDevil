import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports";
import {
  BranchAnalyticsDTO,
  TopSellingItemDTO,
  OrderDistributionDTO,
} from "@/dto/report.dto";

/**
 * Hook to fetch branch analytics data
 * @param branchId - The branch ID to fetch analytics for
 * @param timeframe - The timeframe for analytics (DAY, MONTH, YEAR)
 * @returns Query result with branch analytics data
 */
export const useBranchAnalytics = (
  branchId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR'
) => {
  return useQuery<BranchAnalyticsDTO, Error>({
    queryKey: ["branch-analytics", branchId, timeframe],
    queryFn: () => reportsApi.getBranchAnalytics(branchId!, timeframe),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * Hook to fetch top selling items for a branch
 * @param branchId - The branch ID to fetch top items for
 * @param timeframe - The timeframe for analytics (DAY, MONTH, YEAR)
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Query result with top selling items data
 */
export const useTopSellingItems = (
  branchId: string | undefined,
  timeframe: 'DAY' | 'MONTH' | 'YEAR',
  limit: number = 10
) => {
  return useQuery<TopSellingItemDTO[], Error>({
    queryKey: ["top-selling-items", branchId, timeframe, limit],
    queryFn: () => reportsApi.getTopSellingItems(branchId!, timeframe, limit),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * Hook to fetch order distribution by hour for a specific date
 * @param branchId - The branch ID to fetch distribution for
 * @param date - The date to fetch distribution for (ISO format: YYYY-MM-DD)
 * @returns Query result with order distribution data
 */
export const useOrderDistribution = (
  branchId: string | undefined,
  date: string
) => {
  return useQuery<OrderDistributionDTO[], Error>({
    queryKey: ["order-distribution", branchId, date],
    queryFn: () => reportsApi.getOrderDistribution(branchId!, date),
    enabled: !!branchId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
