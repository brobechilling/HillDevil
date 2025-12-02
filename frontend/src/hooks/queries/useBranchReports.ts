import { useQuery } from '@tanstack/react-query';
import { getBranchAnalytics, getRestaurantBranchPerformance, getBranchTodayStats, getRestaurantAnalytics } from '@/api/reportsApi';
import { BranchAnalyticsDTO, BranchPerformanceDTO, BranchTodayStatsDTO } from '@/dto/report.dto';

export const useBranchAnalytics = (
    branchId: string | undefined,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
) => {
    return useQuery<BranchAnalyticsDTO>({
        queryKey: ['branch-analytics', branchId, reportType, date],
        queryFn: () => {
            if (!branchId) throw new Error('Branch ID is required');
            return getBranchAnalytics(branchId, reportType, date);
        },
        enabled: !!branchId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
    });
};

export const useRestaurantBranchPerformance = (
    restaurantId: string | undefined,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
) => {
    return useQuery<BranchPerformanceDTO[]>({
        queryKey: ['restaurant-branch-performance', restaurantId, reportType, date],
        queryFn: () => {
            if (!restaurantId) throw new Error('Restaurant ID is required');
            return getRestaurantBranchPerformance(restaurantId, reportType, date);
        },
        enabled: !!restaurantId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
    });
};

export const useBranchTodayStats = (branchId: string | undefined) => {
    return useQuery<BranchTodayStatsDTO>({
        queryKey: ['branch-today-stats', branchId],
        queryFn: () => {
            if (!branchId) throw new Error('Branch ID is required');
            return getBranchTodayStats(branchId);
        },
        enabled: !!branchId,
        staleTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    });
};

export const useRestaurantAnalytics = (
    restaurantId: string | undefined,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
) => {
    return useQuery<BranchAnalyticsDTO>({
        queryKey: ['restaurant-analytics', restaurantId, reportType, date],
        queryFn: () => {
            if (!restaurantId) throw new Error('Restaurant ID is required');
            return getRestaurantAnalytics(restaurantId, reportType, date);
        },
        enabled: !!restaurantId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
    });
};
