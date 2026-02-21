import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token || null;
};
export const setRefreshToken = (token: string | null) => {
  refreshToken = token || null;
};

http.interceptors.request.use(async (config) => {
  try {
    const token = accessToken || (await AsyncStorage.getItem(STORAGE_KEYS.token));
    if (token) {
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
    if (error?.response?.status === 402) {
      try {
        const msg = error?.response?.data?.errorMessage || "Subscription required";
        await AsyncStorage.setItem("paywall_reason", String(msg));
      } catch {}
      return Promise.reject(error);
    }
    if (error?.response?.status === 401 && original && !original.__isRetryRequest) {
      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const rt = refreshToken || (await AsyncStorage.getItem(STORAGE_KEYS.refresh));
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
            if (newAccess) setAccessToken(newAccess);
            if (newRefresh) setRefreshToken(newRefresh);
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
