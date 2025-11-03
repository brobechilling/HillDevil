import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { CustomizationDTO, CustomizationCreateRequest } from "@/dto/customization.dto";

export const getAllCustomizations = async (restaurantId: string) => {
  const res = await axiosClient.get<ApiResponse<CustomizationDTO[]>>("/customizations", {
    params: { restaurantId },
  });
  return res.data.result;
};


export const getCustomizationById = async (id: string) => {
  const res = await axiosClient.get<ApiResponse<CustomizationDTO>>(`/customizations/${id}`);
  return res.data.result;
};

export const createCustomization = async (data: CustomizationCreateRequest) => {
  const res = await axiosClient.post<ApiResponse<CustomizationDTO>>("/customizations", data);
  return res.data.result;
};

export const updateCustomization = async (id: string, data: Partial<CustomizationDTO>) => {
  const res = await axiosClient.put<ApiResponse<CustomizationDTO>>(`/customizations/${id}`, data);
  return res.data.result;
};

export const deleteCustomization = async (id: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(`/customizations/${id}`);
  return res.data;
};