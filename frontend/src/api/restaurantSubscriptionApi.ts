import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";

export const restaurantSubscriptionApi = {
  async registerRestaurant(
    data: RestaurantCreateRequest,
    packageId: string
  ): Promise<SubscriptionPaymentResponse> {
    console.log("🌐 API: registerRestaurant called", {data, packageId});
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/restaurant`,
      data,
      { params: { packageId } }
    );
    console.log("🌐 API: registerRestaurant response", res.data.result);
    return res.data.result;
  },

  async renewSubscription(
    restaurantId: string,
    packageId: string
  ): Promise<SubscriptionPaymentResponse> {
    console.log("🌐 API: renewSubscription called", {restaurantId, packageId});
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/subscription/renew`,
      null,
      { params: { restaurantId, packageId } }
    );
    console.log("🌐 API: renewSubscription response", res.data.result);
    return res.data.result;
  },

  async changePackage(
    restaurantId: string,
    newPackageId: string
  ): Promise<SubscriptionPaymentResponse> {
    console.log("🌐 API: changePackage called", {restaurantId, newPackageId});
    const res = await axiosClient.post<ApiResponse<SubscriptionPaymentResponse>>(
      `/registration/subscription/change-package`,
      null,
      { params: { restaurantId, newPackageId } }
    );
    console.log("🌐 API: changePackage response", res.data.result);
    return res.data.result;
  },
};
