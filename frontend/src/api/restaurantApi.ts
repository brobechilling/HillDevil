import { ApiResponse } from "@/dto/apiResponse"
import { axiosClient } from "./axiosClient"
import { RestaurantDTO } from "@/dto/restaurant.dto"
import { PageResponse } from "@/dto/pageResponse";


export const getRestaurants = async (page: number = 1, size: number = 2) => {
  const res = await axiosClient.get<ApiResponse<PageResponse<RestaurantDTO>>>(
    `/restaurants/paginated`,
    {
      params: { page, size },
    }
  );
  return res.data.result;
};

export const getRestaurantsByOwner = async (userId: string) => {
  const res = await axiosClient.get<ApiResponse<RestaurantDTO[]>>(
    `/restaurants/owner/${userId}`
  );
  return res.data.result;
};