import { axiosClient } from "@/api/axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { SubscriptionResponse } from "@/dto/subscription.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";
import { RestaurantSubscriptionOverviewDTO } from "@/dto/subscription.dto";
export const subscriptionApi = {
  getOverviewForOwner: async (): Promise<RestaurantSubscriptionOverviewDTO[]> => {
    const res = await axiosClient.get<ApiResponse<RestaurantSubscriptionOverviewDTO[]>>(
      "/subscriptions/overview"
    );
    return res.data.result || [];
  },

  getStats: async (): Promise<Record<string, number>> => {
    const res = await axiosClient.get<ApiResponse<Record<string, number>>>("/subscriptions/stats");
    return res.data.result || {};
  },

  getAllActive: async (): Promise<SubscriptionResponse[]> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionResponse[]>>("/subscriptions/active");
    return res.data.result || [];
  },

  getActiveByRestaurant: async (
    restaurantId: string
  ): Promise<SubscriptionResponse | null> => {
    try {
      const res = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
        `/subscriptions/restaurant/${restaurantId}/active`
      );
      return res.data.result;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getPaymentHistory: async (
    restaurantId: string
  ): Promise<SubscriptionPaymentResponse[]> => {
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
      return res.data.result;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  activate: async (
    subscriptionId: string,
    durationMonths: number
  ): Promise<SubscriptionResponse> => {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/activate`,
      null,
      { params: { durationMonths } }
    );
    return res.data.result;
  },

  renew: async (
    subscriptionId: string,
    additionalMonths: number
  ): Promise<SubscriptionResponse> => {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/renew`,
      null,
      { params: { additionalMonths } }
    );
    return res.data.result;
  },

  cancel: async (subscriptionId: string): Promise<SubscriptionResponse> => {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/cancel`
    );
    return res.data.result;
  },

  changePackage: async (
    restaurantId: string,
    newPackageId: string
  ): Promise<SubscriptionResponse> => {
    const res = await axiosClient.post<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/change`,
      null,
      { params: { restaurantId, newPackageId } }
    );
    return res.data.result;
  },

  getById: async (id: string): Promise<SubscriptionResponse> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${id}`
    );
    return res.data.result;
  },
};
