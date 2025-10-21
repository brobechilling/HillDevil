import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { FeatureDTO } from "@/dto/feature.dto";

export const featureApi = {
  async getAll(): Promise<FeatureDTO[]> {
    const res = await axiosClient.get<ApiResponse<FeatureDTO[]>>("/features");
    return res.data.result;
  },
};
