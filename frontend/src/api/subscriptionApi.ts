import { axiosClient } from "@/api/axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { SubscriptionResponse, RestaurantSubscriptionOverviewDTO, ActivePackageStatsDTO } from "@/dto/subscription.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";

export const subscriptionApi = {
  getOverviewForOwner: async (): Promise<RestaurantSubscriptionOverviewDTO[]> => {
    const res = await axiosClient.get<ApiResponse<RestaurantSubscriptionOverviewDTO[]>>(
      "/subscriptions/overview"
    );
    return res.data.result || [];
  },

  getAllActive: async (): Promise<SubscriptionResponse[]> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionResponse[]>>(
      "/subscriptions/active"
    );
    return res.data.result || [];
  },

  getActiveByRestaurant: async (restaurantId: string): Promise<SubscriptionResponse | null> => {
    try {
      const res = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
        `/subscriptions/restaurant/${restaurantId}/active`
      );
      return res.data.result ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getPaymentHistory: async (restaurantId: string): Promise<SubscriptionPaymentResponse[]> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse[]>>(
      `/subscriptions/restaurant/${restaurantId}/payments`
    );
    return res.data.result || [];
  },

  getLatestPaymentStatus: async (
    restaurantId: string
  ): Promise<SubscriptionPaymentResponse | null> => {
    try {
      const res = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse>>(
        `/subscriptions/restaurant/${restaurantId}/latest-payment`
      );
      return res.data.result ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  activate: async (
    subscriptionId: string,
    durationMonths: number = 1
  ): Promise<SubscriptionResponse> => {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/activate`,
      null,
      { params: { durationMonths } }
    );
    return res.data.result;
  },

  cancel: async (subscriptionId: string): Promise<void> => {
    await axiosClient.put<ApiResponse<void>>(`/subscriptions/${subscriptionId}/cancel`);
  },

  getById: async (id: string): Promise<SubscriptionResponse> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${id}`
    );
    return res.data.result;
  },

  getActivePackageStats: async (): Promise<ActivePackageStatsDTO[]> => {
    const res = await axiosClient.get<ApiResponse<ActivePackageStatsDTO[]>>(
      "/subscriptions/active-packages"
    );
    return res.data.result || [];
  },
};
