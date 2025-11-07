// axiosClient.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/dto/apiResponse";
import { RefreshResponse } from "@/dto/auth.dto";

let refreshPromise: Promise<string | null> | null = null;
let isRefreshing = false;

export const setAccessToken = (token: string | null) => {
    if (token) {
        localStorage.setItem("accessToken", token);
    } else {
        localStorage.removeItem("accessToken");
    }
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
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
    "/public",
    "/users/mail",
];

const isPublicEndpoint = (url: string = "") =>
    PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const axiosClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        
        // Chỉ thêm token nếu:
        // 1. Token tồn tại và không rỗng
        // 2. Không phải public endpoint
        if (token && token.trim() !== "" && !isPublicEndpoint(config.url)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };
        
        if (!originalRequest || !error.response) {
            return Promise.reject(error);
        }

        const status = error.response.status;
        const url = originalRequest.url || "";
        
        // Initialize retry counter
        originalRequest._retry = originalRequest._retry || 0;

        // Handle 401 Unauthorized
        if (status === 401 && originalRequest._retry < 3 && !isPublicEndpoint(url)) {
            originalRequest._retry += 1;

            // Nếu đang có refresh promise, đợi nó
            if (!refreshPromise) {
                isRefreshing = true;
                refreshPromise = (async () => {
                    try {
                        const res = await axios.post<ApiResponse<RefreshResponse>>(
                            `${baseUrl}/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        
                        const newAccessToken = res.data.result.accessToken;
                        setAccessToken(newAccessToken);
                        
                        return newAccessToken;
                    } catch (err) {
                        // Refresh failed - clear token và redirect
                        setAccessToken(null);
                        isRefreshing = false;
                        // Chỉ redirect một lần, không spam
                        if (!(window.location.pathname === '/login' || window.location.pathname.includes('/login'))) {
                            window.location.href = "/login";
                        }
                        return null;
                    } finally {
                        refreshPromise = null;
                    }
                })();
            }

            const newToken = await refreshPromise;
            isRefreshing = false;
            
            if (!newToken) {
                return Promise.reject(error);
            }

            // Retry original request với token mới
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return axiosClient(originalRequest);
        }

        // Nếu retry quá 3 lần vẫn 401 -> logout
        if (status === 401 && originalRequest._retry >= 3) {
            setAccessToken(null);
            isRefreshing = false;
            // Chỉ redirect một lần, không spam
            if (!(window.location.pathname === '/login' || window.location.pathname.includes('/login'))) {
                window.location.href = "/login";
            }
        }

        // Handle 403 Forbidden
        if (status === 403) {
            console.error("Access forbidden - insufficient permissions");
            // Có thể redirect về trang unauthorized hoặc hiện thông báo
        }

        // Suppress 401 errors trong console khi đang refresh token
        // nhưng vẫn reject error để component có thể xử lý
        if (status === 401 && isRefreshing) {
            // Không log 401 khi đang refresh - tránh spam console
            // Error sẽ được reject để query/mutation có thể xử lý
        }

        return Promise.reject(error);
    }
);