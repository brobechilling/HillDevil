import { axiosClient } from './axiosClient';

export const publicApi = {
  getRestaurantBySlug: async (slug: string) => {
    const res = await axiosClient.get(`/public/restaurant/${slug}`);
    return res.data;
  },

  getTableContext: async (tableId: string) => {
    const res = await axiosClient.get<any>(`/public/table/${tableId}`);
    return res.data;
  },

  // ✅ NEW — dùng slug thay cho branchId
  getRestaurantMenuBySlug: async (slug: string) => {
    const res = await axiosClient.get<any>(`/public/restaurant/${slug}/menu`);
    return res.data;
  },
};
