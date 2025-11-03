import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";

export const getMenuItemsByBranch = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<BranchMenuItemDTO[]>>(
    `/branch-menu-items/branch/${branchId}`
  );
  return res.data.result;
};

export const updateAvailability = async (
  branchMenuItemId: string,
  available: boolean
) => {
  const res = await axiosClient.put<ApiResponse<void>>(
    `/branch-menu-items/${branchMenuItemId}/availability`,
    null,
    { params: { available } }
  );
  return res.data;
};