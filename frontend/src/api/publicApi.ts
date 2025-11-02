import { axiosClient } from './axiosClient';
import { ApiResponse } from '@/dto/apiResponse';

export const publicApi = {
    getRestaurantBySlug: async (slug: string) => {
        const res = await axiosClient.get<any>(`/public/restaurant/${slug}`);
        // Backend returns the RestaurantPublicResponse directly (not wrapped in ApiResponse), so return res.data
        return res.data;
    },

    getTableContext: async (tableId: string) => {
        const res = await axiosClient.get<any>(`/public/table/${tableId}`);
        return res.data;
    },

    getBranchMenu: async (branchId: string) => {
        const res = await axiosClient.get<any>(`/public/branch/${branchId}/menu`);
        return res.data;
    }
};
