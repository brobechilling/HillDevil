import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import {
    BranchAnalyticsDTO,
    TopSellingItemDTO,
    OrderDistributionDTO,
    BranchPerformanceDTO,
    BranchTodayStatsDTO,
} from "@/dto/report.dto";

export const reportsApi = {
    // Restaurant-level analytics (aggregated from all branches)
    getRestaurantAnalytics: async (
        restaurantId: string,
        timeframe: 'DAY' | 'MONTH' | 'YEAR'
    ) => {
        const res = await axiosClient.get<ApiResponse<BranchAnalyticsDTO>>(
            `/reports/restaurant/${restaurantId}/analytics`,
            { params: { timeframe } }
        );
        return res.data.result;
    },

    getRestaurantTopSellingItems: async (
        restaurantId: string,
        timeframe: 'DAY' | 'MONTH' | 'YEAR',
        limit: number = 10
    ) => {
        const res = await axiosClient.get<ApiResponse<TopSellingItemDTO[]>>(
            `/reports/restaurant/${restaurantId}/top-items`,
            { params: { timeframe, limit } }
        );
        return res.data.result;
    },

    getRestaurantOrderDistribution: async (restaurantId: string, date: string) => {
        const res = await axiosClient.get<ApiResponse<OrderDistributionDTO[]>>(
            `/reports/restaurant/${restaurantId}/order-distribution`,
            { params: { date } }
        );
        return res.data.result;
    },

    // Branch-level analytics (kept for backward compatibility)
    getBranchAnalytics: async (
        branchId: string,
        timeframe: 'DAY' | 'MONTH' | 'YEAR'
    ) => {
        const res = await axiosClient.get<ApiResponse<BranchAnalyticsDTO>>(
            `/reports/branch/${branchId}/analytics`,
            { params: { timeframe } }
        );
        return res.data.result;
    },

    getTopSellingItems: async (
        branchId: string,
        timeframe: 'DAY' | 'MONTH' | 'YEAR',
        limit: number = 10
    ) => {
        const res = await axiosClient.get<ApiResponse<TopSellingItemDTO[]>>(
            `/reports/branch/${branchId}/top-items`,
            { params: { timeframe, limit } }
        );
        return res.data.result;
    },

    getOrderDistribution: async (branchId: string, date: string) => {
        const res = await axiosClient.get<ApiResponse<OrderDistributionDTO[]>>(
            `/reports/branch/${branchId}/order-distribution`,
            { params: { date } }
        );
        return res.data.result;
    },
};

// Branch Report APIs
export const getBranchAnalytics = async (
    branchId: string,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
): Promise<BranchAnalyticsDTO> => {
    const params: any = { reportType };
    if (date) params.date = date;

    const response = await axiosClient.get<ApiResponse<BranchAnalyticsDTO>>(
        `/branch-reports/branch/${branchId}/analytics`,
        { params }
    );
    return response.data.result;
};

export const getRestaurantBranchPerformance = async (
    restaurantId: string,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
): Promise<BranchPerformanceDTO[]> => {
    const params: any = { reportType };
    if (date) params.date = date;

    const response = await axiosClient.get<ApiResponse<BranchPerformanceDTO[]>>(
        `/branch-reports/restaurant/${restaurantId}/branch-performance`,
        { params }
    );
    return response.data.result;
};

export const getBranchTodayStats = async (
    branchId: string
): Promise<BranchTodayStatsDTO> => {
    const response = await axiosClient.get<ApiResponse<BranchTodayStatsDTO>>(
        `/branch-reports/branch/${branchId}/today-stats`
    );
    return response.data.result;
};

export const getRestaurantAnalytics = async (
    restaurantId: string,
    reportType: 'DAY' | 'MONTH' | 'YEAR',
    date?: string
): Promise<BranchAnalyticsDTO> => {
    const params: any = { reportType };
    if (date) params.date = date;

    const response = await axiosClient.get<ApiResponse<BranchAnalyticsDTO>>(
        `/branch-reports/restaurant/${restaurantId}/analytics`,
        { params }
    );
    return response.data.result;
};
