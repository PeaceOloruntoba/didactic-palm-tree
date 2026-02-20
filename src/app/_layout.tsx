import { useEffect } from "react";
import "../global.css";
import { Slot } from "expo-router";

export default function Layout() {
    useEffect(() => {
    const prev = (global as any).ErrorUtils?.getGlobalHandler?.();
    (global as any).ErrorUtils?.setGlobalHandler?.((err: any, isFatal?: boolean) => {
      try {
        console.error("GlobalError:", isFatal, err?.message, err?.stack);
      } catch {}
      if (prev) prev(err, isFatal);
    });
  }, []);
  return <Slot />;
}
