import { useEffect } from "react";
import "../global.css";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "../store/auth";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const { hydrated, bootstrap } = useAuth();

  useEffect(() => {
    const prev = (global as any).ErrorUtils?.getGlobalHandler?.();
    (global as any).ErrorUtils?.setGlobalHandler?.((err: any, isFatal?: boolean) => {
      try {
        console.error("GlobalError:", isFatal, err?.message, err?.stack);
      } catch {}
      if (prev) prev(err, isFatal);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hydrated]);

  if (!hydrated) return null;
  return <Slot />;
}
