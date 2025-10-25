import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";

export const registrationApi = {
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
};
