import { AuthenticationRequest, AuthenticationResponse } from "@/dto/auth.dto";
import { axiosClient, setAccessToken } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";
import { UserDTO } from "@/dto/user.dto";

export const authApi = {
  async login(authenticationRequest: AuthenticationRequest) {
    const res = await axiosClient.post<ApiResponse<AuthenticationResponse>>("/auth/token", authenticationRequest);
    const accessToken = res.data.result.accessToken;
    setAccessToken(accessToken);
    return res.data.result;
  },

  async logout() {
    await axiosClient.post("/auth/logout");
    setAccessToken(null);
  },

  async testGetUsers() {
    const res = await axiosClient.get<ApiResponse<UserDTO[]>>("/users");
    return res.data.result;
  },
};
