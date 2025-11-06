import { create } from "zustand";
import { http } from "../lib/http";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";

export type User = { id: string; email: string; name?: string };

type State = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
};

type Actions = {
  bootstrap: () => Promise<void>;
  register: (payload: { email: string; password: string; name?: string }) => Promise<{ message: string; otp?: string }|void>;
  verifyOtp: (payload: { email: string; code: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (payload: { email: string }) => Promise<void>;
  resetPassword: (payload: { email: string; code: string; password: string }) => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
};

export const useAuth = create<State & Actions>((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  hydrated: false,

  bootstrap: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      if (token) {
        set({ token });
        await get().fetchMe().catch(() => {});
      }
    } finally {
      set({ hydrated: true });
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await http.post("/auth/register", payload);
      return data;
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Registration failed" });
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (payload) => {
    set({ loading: true, error: null });
    try {
      await http.post("/auth/verify-otp", payload);
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "OTP verification failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await http.post("/auth/login", payload);
      const token = data?.token as string | undefined;
      if (token) {
        await AsyncStorage.setItem(STORAGE_KEYS.token, token);
        set({ token });
        await get().fetchMe();
      } else {
        throw new Error("No token in response");
      }
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Login failed" });
      console.log(e)
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await http.post("/auth/logout").catch(() => {});
    } finally {
      await AsyncStorage.removeItem(STORAGE_KEYS.token);
      set({ token: null, user: null });
    }
  },

  forgotPassword: async (payload) => {
    set({ loading: true, error: null });
    try {
      await http.post("/auth/forgot-password", payload);
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Failed to send reset code" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (payload) => {
    set({ loading: true, error: null });
    try {
      await http.post("/auth/reset-password", payload);
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Failed to reset password" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await http.get("/users/me");
      set({ user: data });
    } catch (e: any) {
      // If unauthorized, clear session
      await AsyncStorage.removeItem(STORAGE_KEYS.token);
      set({ token: null, user: null });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
