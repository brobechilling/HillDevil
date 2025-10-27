import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { SubscriptionRequest, SubscriptionResponse } from "@/dto/subscription.dto";

export const subscriptionApi = {
  async create(data: SubscriptionRequest): Promise<SubscriptionResponse> {
    const res = await axiosClient.post<ApiResponse<SubscriptionResponse>>(
      "/subscriptions",
      data
    );
    return res.data.result;
  },

  async activate(subscriptionId: string, durationMonths = 1): Promise<SubscriptionResponse> {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/activate`,
      null,
      { params: { durationMonths } }
    );
    return res.data.result;
  },

  async renew(subscriptionId: string, additionalMonths = 1): Promise<SubscriptionResponse> {
    const res = await axiosClient.put<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/renew`,
      null,
      { params: { additionalMonths } }
    );
    return res.data.result;
  },

  async getById(id: string): Promise<SubscriptionResponse> {
    const res = await axiosClient.get<ApiResponse<SubscriptionResponse>>(`/subscriptions/${id}`);
    return res.data.result;
  },
};
