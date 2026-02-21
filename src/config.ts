import { Platform } from "react-native";

const DEV_BASE = Platform.OS === "android" ? "http://10.0.2.2:4000/v1" : "http://localhost:4000/v1";
const PROD_BASE = "https://solid-octo-invention-39cx.vercel.app/v1";
const USE_LOCAL = process.env.EXPO_PUBLIC_USE_LOCAL_BASE === "1";

export const API_BASE_URL = (
  (process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") as string | undefined) ||
  (USE_LOCAL ? DEV_BASE : PROD_BASE)
);

export const STORAGE_KEYS = {
  token: "auth_token",
  refresh: "refresh_token",
};
