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

let refreshPromise: Promise<string | null> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    if (error?.response?.status === 401 && original && !original.__isRetryRequest) {
      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const rt = await AsyncStorage.getItem(STORAGE_KEYS.refresh);
            if (!rt) return null;
            const { data } = await axios.post(
              `${API_BASE_URL.replace(/\/$/, "")}/auth/refresh`,
              {},
              { headers: { Authorization: `Refresh ${rt}` } }
            );
            const newAccess = data?.token as string | undefined;
            const newRefresh = data?.refresh_token as string | undefined;
            if (newAccess) await AsyncStorage.setItem(STORAGE_KEYS.token, newAccess);
            if (newRefresh) await AsyncStorage.setItem(STORAGE_KEYS.refresh, newRefresh);
            return newAccess || null;
          })().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        if (newToken) {
          original.__isRetryRequest = true;
          (original.headers = original.headers || {});
          (original.headers as any).Authorization = `Bearer ${newToken}`;
          return http(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);
