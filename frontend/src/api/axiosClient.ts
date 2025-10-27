import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/dto/apiResponse";
import { RefreshResponse } from "@/dto/auth.dto";

let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
    localStorage.setItem("accessToken", token ?? "");
};

const PUBLIC_ENDPOINTS = [
    "/auth/token",
    "/auth/logout",
    "/auth/refresh",
    "/users/signup",
    "/payments/webhook",
    "/restaurants/paginated",
    "/packages",
    "/branches",
];

const isPublicEndpoint = (url: string = "") =>
    PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const axiosClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token != "" && !isPublicEndpoint(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };
        if (!originalRequest || !error.response)
            return Promise.reject(error);

        const status = error.response.status;
        originalRequest._retry = originalRequest._retry || 0;

        if (status === 401 && originalRequest._retry < 3 && !isPublicEndpoint(originalRequest.url || "")) {
            originalRequest._retry += 1;

            if (!refreshPromise) {
                refreshPromise = (async () => {
                    try {
                        const res = await axios.post<ApiResponse<RefreshResponse>>(
                            `${baseUrl}/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        const newAccessToken = res.data.result.accessToken;
                        setAccessToken(newAccessToken);
                        axiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                        return newAccessToken;
                    } catch (err) {
                        setAccessToken(null);
                        window.location.href = "/login";
                        return null;
                    } finally {
                        refreshPromise = null;
                    }
                })();
            }

            const newToken = await refreshPromise;
            if (!newToken)
                return Promise.reject(error);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
        }

        if (status === 401 && originalRequest._retry >= 3) {
            setAccessToken(null);
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

