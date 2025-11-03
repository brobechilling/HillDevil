import { create } from "zustand";
import { UserDTO } from "@/dto/user.dto";
import { logout } from "@/api/authApi";
import { setAccessToken, axiosClient } from "@/api/axiosClient";
import { StaffAccountDTO } from "@/dto/staff.dto";
import { ApiResponse } from "@/dto/apiResponse";
import { RefreshResponse } from "@/dto/auth.dto"; 

interface SessionState {
  user: UserDTO | StaffAccountDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: string | null;
  branchId: string | null;
  initialize: () => Promise<void>;
  setSession: (
    user: UserDTO | StaffAccountDTO,
    token: string,
    restaurantId?: string | null,
    branchId?: string | null
  ) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  restaurantId: null,
  branchId: null,

  initialize: async () => {
    const storedToken = localStorage.getItem("accessToken");
    const userJson = localStorage.getItem("user");
    const restaurantId = localStorage.getItem("restaurantId");
    const branchId = localStorage.getItem("branchId");

    // ✅ Nếu không có accessToken, thử refresh ngay
    if (!storedToken && userJson) {
      try {
        const res = await axiosClient.post<ApiResponse<RefreshResponse>>(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = res.data.result.accessToken;
        setAccessToken(newToken);
        const parsedUser = JSON.parse(userJson);
        set({
          user: parsedUser,
          token: newToken,
          isAuthenticated: true,
          isLoading: false,
          restaurantId: restaurantId ?? null,
          branchId: branchId ?? null,
        });
        return;
      } catch (err) {
        console.warn("Refresh token failed:", err);
        localStorage.removeItem("user");
      }
    }

    // ✅ Nếu có accessToken, mount luôn session
    if (storedToken && userJson && storedToken !== "") {
      try {
        const parsedUser = JSON.parse(userJson);
        setAccessToken(storedToken);
        set({
          user: parsedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          restaurantId: restaurantId ?? null,
          branchId: branchId ?? null,
        });
      } catch (e) {
        console.error("Failed to parse user:", e);
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          restaurantId: null,
          branchId: null,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        restaurantId: null,
        branchId: null,
      });
    }
  },

  setSession: (user, token, restaurantId = null, branchId = null) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    if (restaurantId) localStorage.setItem("restaurantId", restaurantId);
    if (branchId) localStorage.setItem("branchId", branchId);
    setAccessToken(token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      restaurantId,
      branchId,
    });
  },

  clearSession: async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout API failed:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("branchId");
    setAccessToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      restaurantId: null,
      branchId: null,
    });
  },
}));
