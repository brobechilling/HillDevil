// authApi.ts
import { AuthenticationRequest, AuthenticationResponse } from "@/dto/auth.dto";
import { axiosClient, setAccessToken } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";

export const login = async (authenticationRequest: AuthenticationRequest) => {
    try {
        const res = await axiosClient.post<ApiResponse<AuthenticationResponse>>(
            "/auth/token", 
            authenticationRequest
        );
        
        const { accessToken, user } = res.data.result;
        
        // Lưu token
        setAccessToken(accessToken);
        
        // Có thể lưu thêm user info nếu cần
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
        
        return res.data.result;
    } catch (error) {
        // Clear token nếu login fail
        setAccessToken(null);
        localStorage.removeItem("user");
        throw error;
    }
};

export const logout = async () => {
    try {
        await axiosClient.post("/auth/logout");
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Luôn clear local data khi logout
        setAccessToken(null);
        localStorage.removeItem("user");
        
        // Redirect về login
        window.location.href = "/login";
    }
};

// Thêm helper để check authentication status
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token && token.trim() !== "";
};

// Thêm helper để get user info
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};