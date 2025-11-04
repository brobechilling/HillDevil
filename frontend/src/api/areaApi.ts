import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";

export interface AreaDTO {
  areaId: string;
  name: string;
  status: boolean;
}

export interface CreateAreaRequest {
  branchId: string;
  name: string;
}

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const getAreasByBranch = async (branchId: string) => {
  // Validate branchId trước khi gọi API
  if (!branchId || branchId.trim() === '') {
    throw new Error('BranchId is required');
  }
  
  const trimmedBranchId = branchId.trim();
  
  // Validate UUID format
  if (!isValidUUID(trimmedBranchId)) {
    throw new Error(`Invalid branchId format. Expected UUID, got: ${trimmedBranchId}`);
  }
  
  const res = await axiosClient.get<ApiResponse<AreaDTO[]>>(
    "/owner/areas",
    {
      params: { branchId: trimmedBranchId },
    }
  );
  return res.data.result;
};

/**
 * Tạo area mới
 */
export const createArea = async (data: CreateAreaRequest): Promise<AreaDTO> => {
  if (!data.branchId || data.branchId.trim() === '') {
    throw new Error('BranchId is required');
  }
  if (!data.name || data.name.trim() === '') {
    throw new Error('Area name is required');
  }
  
  const trimmedBranchId = data.branchId.trim();
  
  // Validate UUID format
  if (!isValidUUID(trimmedBranchId)) {
    throw new Error(`Invalid branchId format. Expected UUID, got: ${trimmedBranchId}`);
  }
  
  const res = await axiosClient.post<ApiResponse<AreaDTO>>(
    "/owner/areas",
    {
      branchId: trimmedBranchId,
      name: data.name.trim(),
    }
  );
  return res.data.result!;
};

/**
 * Xóa area
 */
export const deleteArea = async (areaId: string): Promise<void> => {
  if (!areaId || areaId.trim() === '') {
    throw new Error('AreaId is required');
  }
  
  const trimmedAreaId = areaId.trim();
  
  // Validate UUID format
  if (!isValidUUID(trimmedAreaId)) {
    throw new Error(`Invalid areaId format. Expected UUID, got: ${trimmedAreaId}`);
  }
  
  const res = await axiosClient.delete<ApiResponse<void>>(
    `/owner/areas/${trimmedAreaId}`
  );
  // Kiểm tra response status - nếu không phải success thì throw error
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Failed to delete area: ${res.status}`);
  }
};