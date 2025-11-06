import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
    if (token) {
      // Ensure headers exists and then mutate to avoid typing issues
      (config.headers as any) = (config.headers as any) || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      // For now, on mobile we log out on 401. Refresh cookie flow is web-only by default.
    }
    return Promise.reject(error);
  }
);
