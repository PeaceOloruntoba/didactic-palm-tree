import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../store/auth";

export default function Page() {
  const { token, hydrated, bootstrap } = useAuth();

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  if (!hydrated) return <View className="flex-1" />;
  if (token) return <Redirect href="/(app)/dashboard" />;
  return <Redirect href="/(auth)/login" />;
}
