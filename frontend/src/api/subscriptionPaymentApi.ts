import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { SubscriptionPaymentResponse, TopSpenderDTO } from "@/dto/subscriptionPayment.dto";


export const subscriptionPaymentApi = {
  async create(subscriptionId: string): Promise<SubscriptionPaymentResponse> {
    try {
      const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
        `/payments/create`,
        null,
        { params: { subscriptionId } }
      );
      return res.data.result;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  },

  async getStatus(orderCode: string): Promise<SubscriptionPaymentResponse> {
    const res = await axiosClient.get<ApiResponse<SubscriptionPaymentResponse>>(
      `/payments/status/${orderCode}`
    );
    return res.data.result;
  },

  async cancel(orderCode: string): Promise<SubscriptionPaymentResponse> {
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/payments/cancel/${orderCode}`
    );
    return res.data.result;
  },

    getTop5SpendingUsers: async (): Promise<TopSpenderDTO[]> => {
      const res = await axiosClient.get<ApiResponse<TopSpenderDTO[]>>(
        "/payments/top-spenders"
      );
      return res.data.result || [];
    },
};
