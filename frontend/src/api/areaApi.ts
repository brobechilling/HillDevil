import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";

export interface AreaDTO {
  areaId: string;
  name: string;
  status: boolean;
}

export const getAreasByBranch = async (branchId: string) => {
  const res = await axiosClient.get<ApiResponse<AreaDTO[]>>(
    "/owner/areas",
    {
      params: { branchId },
    }
  );
  return res.data.result;
};