import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { CreatePackageDTO, UpdatePackageDTO, PackageFeatureDTO } from "@/dto/packageFeature.dto";

export const packageApi = {
  async getAll(): Promise<PackageFeatureDTO[]> {
    const res = await axiosClient.get<ApiResponse<PackageFeatureDTO[]>>("/packages");
    return res.data?.result ?? [];
  },

  async getById(id: string): Promise<PackageFeatureDTO> {
    const res = await axiosClient.get<ApiResponse<PackageFeatureDTO>>(`/packages/${id}`);
    return res.data.result;
  },

  async create(data: CreatePackageDTO): Promise<PackageFeatureDTO> {
    const res = await axiosClient.post<ApiResponse<PackageFeatureDTO>>("/packages", data);
    return res.data.result;
  },

  async update(id: string, data: UpdatePackageDTO): Promise<PackageFeatureDTO> {
    const res = await axiosClient.put<ApiResponse<PackageFeatureDTO>>(`/packages/${id}`, data);
    return res.data.result;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(`/packages/${id}`);
  },

  async deleteFeature(packageId: string, featureId: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(`/packages/${packageId}/features/${featureId}`);
  },

  async deactivate(id: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(`/packages/${id}/deactivate`);
  },

  async activate(id: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(`/packages/${id}/activate`);
  },
};
