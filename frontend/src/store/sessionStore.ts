import { create } from "zustand";
import { UserDTO } from "@/dto/user.dto";
import { logout } from "@/api/authApi";
import { setAccessToken } from "@/api/axiosClient";
import { StaffAccountDTO } from "@/dto/staff.dto";

interface SessionState {
  user: UserDTO | StaffAccountDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  setSession: (user: UserDTO | StaffAccountDTO, token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // ✅ Đánh dấu đang loading session

  initialize: () => {
    const storedToken = localStorage.getItem("accessToken");
    const userJson = localStorage.getItem("user");

    if (storedToken && userJson && storedToken !== "") {
      try {
        const parsedUser = JSON.parse(userJson);
        // ✅ Gán token ngay cho axios client
        setAccessToken(storedToken);
        set({
          user: parsedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
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
}));
