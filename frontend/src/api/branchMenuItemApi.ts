import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { BranchMenuItemDTO, GuestBranchMenuItemDTO } from "@/dto/branchMenuItem.dto";

export const getMenuItemsByBranch = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<BranchMenuItemDTO[]>>(
    `/branch-menu-items/branch/${branchId}`
  );
  return res.data.result;
};

export const updateAvailability = async (
  branchId: string,
  menuItemId: string,
  available: boolean
) => {
  const res = await axiosClient.put<ApiResponse<void>>(
    `/branch-menu-items/availability`,
    null,
    { params: { branchId, menuItemId, available } }
  );
  return res.data;
};


export const getGuestBranchMenuItems = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<GuestBranchMenuItemDTO[]>>(`/branch-menu-items/guest/branch/${branchId}`);
  return res.data.result;
};
