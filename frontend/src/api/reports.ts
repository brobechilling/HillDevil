import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import {
    BranchAnalyticsDTO,
    TopSellingItemDTO,
    OrderDistributionDTO,
} from "@/dto/report.dto";

export const reportsApi = {
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
