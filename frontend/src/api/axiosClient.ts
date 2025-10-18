import { ApiResponse } from "@/dto/apiResponse";
import { RefreshResponse } from "@/dto/auth.dto";
import axios from "axios";

// store accessToken in memory -> it only disappear when reload the whole page

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const axiosClient = axios.create({
    baseURL: "/api",
    withCredentials: true, // allow cookie http only
});


const PUBLIC_ENDPOINTS = [
    "/auth/token",
    "/auth/logout",
    "/auth/refresh",
    "/users/signup",
    "/payments/webhook"
];

const isPublicEndpoint = (url: string = "") =>
    PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));

axiosClient.interceptors.request.use((config) => {
    if (accessToken && !isPublicEndpoint(config.url)) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});


axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        originalRequest._retry = originalRequest._retry || 0;
        if (error.response?.status === 401 && originalRequest._retry < 3) {
            originalRequest._retry += 1;
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const res = await axiosClient.post<ApiResponse<RefreshResponse>>("/auth/refresh");
                const newAccessToken = res.data.result.accessToken;
                setAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            } catch (err) {
                setAccessToken(null);
                window.location.href = "/login";
            }
        } else if (error.response?.status === 401 && originalRequest._retry >= 3) {
            setAccessToken(null);
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

