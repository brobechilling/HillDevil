import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";

export const restaurantSubscriptionApi = {
  async registerRestaurant(
    data: RestaurantCreateRequest,
    packageId: string
  ): Promise<SubscriptionPaymentResponse> {
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/restaurant`,
      data,
      { params: { packageId } }
    );
    return res.data.result;
  },

  async renewSubscription(
    restaurantId: string,
  ): Promise<SubscriptionPaymentResponse> {
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/subscription/renew`,
      null,
      { params: { restaurantId } }
    );
    return res.data.result;
  },

  async upgradeRestaurantPackage(
    restaurantId: string,
    newPackageId: string
  ): Promise<SubscriptionPaymentResponse> {
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/subscription/upgrade-package`,
      null,
      { params: { restaurantId, newPackageId } }
    );
    return res.data.result;
  },
};
