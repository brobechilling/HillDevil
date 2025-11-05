import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { BranchDTO, CreateBranchDTO, UpdateBranchDTO } from "@/dto/branch.dto";

export const getAllBranches = async () => {
    const res = await axiosClient.get<ApiResponse<BranchDTO[]>>("/branches");
    return res.data.result;
};

export const getBranchById = async (id: string) => {
    const res = await axiosClient.get<ApiResponse<BranchDTO>>(`/branches/${id}`);
    return res.data.result;
};

export const getBranchesByRestaurant = async (restaurantId: string) => {
    const res = await axiosClient.get<ApiResponse<BranchDTO[]>>(
        `/branches/restaurant/${restaurantId}`
    );
    return res.data.result;
};

export const createBranch = async (data: CreateBranchDTO) => {
    const res = await axiosClient.post<ApiResponse<BranchDTO>>("/branches", data);
    return res.data.result;
};

export const updateBranch = async (id: string, data: UpdateBranchDTO) => {
    const res = await axiosClient.put<ApiResponse<BranchDTO>>(
        `/branches/${id}`,
        data
    );
    return res.data.result;
};

export const deleteBranch = async (id: string) => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/branches/${id}`);
    return res.data;
};

export const getRestaurantByBranchId = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<string>>(
        `/branches/${branchId}/restaurant`
    );
    return res.data.result;
};
