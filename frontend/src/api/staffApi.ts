import { CreateStaffAccountRequest, StaffAccountDTO } from "@/dto/staff.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { PageResponse } from "@/dto/pageResponse";


export const createStaffAccount = async ( createStaffAccountRequest : CreateStaffAccountRequest) => {
    const res = await axiosClient.post<ApiResponse<StaffAccountDTO>>("/staff", createStaffAccountRequest);
    return res.data.result;
};

export const getStaffAccounts = async (page: number = 1, size: number = 2, branchId: string) => {
  const res = await axiosClient.get<ApiResponse<PageResponse<StaffAccountDTO>>>(
    `/staff/paginated`,
    {
      params: { page, size, branchId },
    }
  );
  return res.data.result;
};

export const getStaffAccountsByRestaurant = async (page: number = 1, size: number = 2, restaurantId: string) => {
  const res = await axiosClient.get<ApiResponse<PageResponse<StaffAccountDTO>>>(
    `/staff/paginated/restaurant`,
    {
      params: { page, size, restaurantId },
    }
  );
  return res.data.result;
};

export const getWaiterNumber = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<number>>(`/staff/statistic/waiter/${branchId}`);
  return res.data.result;
};

export const getReceptionistNumber = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<number>>(`/staff/statistic/receptionist/${branchId}`);
  return res.data.result;
};

export const getManagerNumber = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<number>>(`/staff/statistic/manager/${branchId}`);
  return res.data.result;
};

export const setStaffAccountStatus = async (staffAccountId: string) => {
  const res = await axiosClient.delete<ApiResponse<StaffAccountDTO>>(`/staff/${staffAccountId}`);
  return res.data.result;
};

export const getStaffAccountById = async (staffAccountId: string) => {
  const res = await axiosClient.get<ApiResponse<StaffAccountDTO>>(`/staff/${staffAccountId}`);
  return res.data.result;
};

export interface ResetPasswordResponse {
  staffAccountId: string;
  username: string;
  newPassword: string; // Password gốc (plain text)
}

export interface ResetPasswordRequest {
  newPassword?: string; // Optional: nếu không có thì auto generate
}

export const resetStaffPassword = async (
  staffAccountId: string, 
  request?: ResetPasswordRequest
) => {
  const res = await axiosClient.post<ApiResponse<ResetPasswordResponse>>(
    `/staff/${staffAccountId}/reset-password`,
    request || {}
  );
  return res.data.result;
};