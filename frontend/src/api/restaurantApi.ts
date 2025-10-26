import { ApiResponse } from "@/dto/apiResponse"
import { axiosClient } from "./axiosClient"
import { RestaurantDTO } from "@/dto/restaurant.dto"
import { PageResponse } from "@/dto/pageResponse";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";


export const getAllRestaurants = async () => {
  const res = await axiosClient.get<ApiResponse<RestaurantDTO[]>>("/restaurants");
  return res.data.result;
};

export const getRestaurants = async (page: number = 1, size: number = 2) => {
  const res = await axiosClient.get<ApiResponse<PageResponse<RestaurantDTO>>>(
    `/restaurants/paginated`,
    {
      params: { page, size },
    }
  );
  return res.data.result;
};

export const getRestaurantById = async (id: string) => {
  const res = await axiosClient.get<ApiResponse<RestaurantDTO>>(`/restaurants/${id}`);
  return res.data.result;
};

export const getRestaurantsByOwner = async (userId: string) => {
  const res = await axiosClient.get<ApiResponse<RestaurantDTO[]>>(
    `/restaurants/owner/${userId}`
  );
  return res.data.result;
};

export const createRestaurant = async (
  data: RestaurantCreateRequest
): Promise<RestaurantDTO> => {
  const res = await axiosClient.post<ApiResponse<RestaurantDTO>>(
    "/restaurants",
    data
  );
  return res.data.result;
};

export const updateRestaurant = async (id: string, data: Partial<RestaurantDTO>) => {
  const res = await axiosClient.put<ApiResponse<RestaurantDTO>>(`/restaurants/${id}`, data);
  return res.data.result;
};

export const deleteRestaurant = async (id: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(`/restaurants/${id}`);
  return res.data;
};