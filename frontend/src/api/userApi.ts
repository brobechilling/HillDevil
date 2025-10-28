import { SignupRequest, UserDTO } from "@/dto/user.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { PageResponse } from "@/dto/pageResponse";

export const register = async (signupRequest: SignupRequest) => {
    const res = await axiosClient.post<ApiResponse<UserDTO>>("/users/signup", signupRequest);
    return res.data.result;
}

export const getUsers = async (page: number = 1, size: number = 2) => {
  const res = await axiosClient.get<ApiResponse<PageResponse<UserDTO>>>(
    `/users/paginated`,
    {
      params: { page, size },
    }
  );
  return res.data.result;
};


export const updateUser = async (updateUser: UserDTO) => {
  const res = await axiosClient.put<ApiResponse<UserDTO>>("/users", updateUser);
  return res.data.result;
};

export const setUserStatus = async (userId: string) => {
  const res = await axiosClient.delete<ApiResponse<UserDTO>>(`/users/${userId}`);
  return res.data.result;
};
