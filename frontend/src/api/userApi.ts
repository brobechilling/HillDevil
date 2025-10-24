import { SignupRequest, UserDTO } from "@/dto/user.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";

export const register = async (signupRequest: SignupRequest) => {
    const res = await axiosClient.post<ApiResponse<UserDTO>>("/users/signup", signupRequest);
    return res.data.result;
}