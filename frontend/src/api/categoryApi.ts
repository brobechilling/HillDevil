import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { CategoryDTO, CategoryCreateRequest } from "@/dto/category.dto";

export const getAllCategories = async () => {
  const res = await axiosClient.get<ApiResponse<CategoryDTO[]>>("/categories");
  return res.data.result;
};

export const getCategoryById = async (id: string) => {
  const res = await axiosClient.get<ApiResponse<CategoryDTO>>(`/categories/${id}`);
  return res.data.result;
};

export const createCategory = async (data: CategoryCreateRequest) => {
  const res = await axiosClient.post<ApiResponse<CategoryDTO>>("/categories", data);
  return res.data.result;
};

export const updateCategory = async (id: string, data: Partial<CategoryDTO>) => {
  const res = await axiosClient.put<ApiResponse<CategoryDTO>>(`/categories/${id}`, data);
  return res.data.result;
};

export const deleteCategory = async (id: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(`/categories/${id}`);
  return res.data;
};