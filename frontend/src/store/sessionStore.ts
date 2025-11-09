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
  initialize: () => Promise<void>;
  setSession: (user: UserDTO | StaffAccountDTO, token: string) => void;
  clearSession: () => void;
  updateUser: (user: UserDTO) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const storedToken = localStorage.getItem("accessToken");
    const userJson = localStorage.getItem("user");

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
        });
        return;
      } catch (err) {
        console.warn("Refresh token failed:", err);
        localStorage.removeItem("user");
      }
    }

    
    if (storedToken && userJson && storedToken !== "") {
      try {
        const parsedUser = JSON.parse(userJson);
        setAccessToken(storedToken);
        set({
          user: parsedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        console.error("Failed to parse user:", e);
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setSession: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearSession: async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout API failed:", err);
    }
    localStorage.removeItem("user");
    setAccessToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // update user in memory and local storage
  updateUser: (updatedUser: UserDTO) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({
      user: updatedUser,
    });
  },
}));