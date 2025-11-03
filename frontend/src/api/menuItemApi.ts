import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { MenuItemDTO, MenuItemCreateRequest } from "@/dto/menuItem.dto";

export const getAllMenuItems = async (restaurantId: string) => {
  const res = await axiosClient.get<ApiResponse<MenuItemDTO[]>>("/menu-items", {
    params: { restaurantId },
  });
  return res.data.result;
};

export const getMenuItemById = async (id: string) => {
  const res = await axiosClient.get<ApiResponse<MenuItemDTO>>(`/menu-items/${id}`);
  return res.data.result;
};

export const createMenuItem = async (
  data: MenuItemCreateRequest,
  imageFile?: File
) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (imageFile) formData.append("imageFile", imageFile);

  const res = await axiosClient.post<ApiResponse<MenuItemDTO>>(
    "/menu-items/create",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.result;
};

export const updateMenuItem = async (
  id: string,
  data: MenuItemCreateRequest,
  imageFile?: File
) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (imageFile) formData.append("imageFile", imageFile);

  const res = await axiosClient.put<ApiResponse<MenuItemDTO>>(
    `/menu-items/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.result;
};

export const deleteMenuItem = async (id: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(`/menu-items/${id}`);
  return res.data;
};

export const isMenuItemActiveInBranch = async (menuItemId: string, branchId: string) => {
  const res = await axiosClient.get<ApiResponse<boolean>>(
    `/menu-items/${menuItemId}/branch/${branchId}/active`
  );
  return res.data.result;
};

export const setActiveStatus = async (menuItemId: string, active: boolean) => {
  const res = await axiosClient.put<ApiResponse<MenuItemDTO>>(
    `/menu-items/${menuItemId}/status`,
    null,
    { params: { active } }
  );
  return res.data.result;
};


export const updateBestSeller = async (menuItemId: string, bestSeller: boolean) => {
  const res = await axiosClient.put<ApiResponse<MenuItemDTO>>(
    `/menu-items/${menuItemId}/best-seller`,
    null,
    { params: { bestSeller } }
  );
  return res.data.result;
};
