import { AuthenticationRequest, AuthenticationResponse } from "@/dto/auth.dto";
import { axiosClient, setAccessToken } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";


export const login = async (authenticationRequest: AuthenticationRequest) => {
  const res = await axiosClient.post<ApiResponse<AuthenticationResponse>>("/auth/token", authenticationRequest);
  const accessToken = res.data.result.accessToken;
  setAccessToken(accessToken);
  return res.data.result;
};

export const logout = async () => {
  await axiosClient.post("/auth/logout");
  setAccessToken(null);
};