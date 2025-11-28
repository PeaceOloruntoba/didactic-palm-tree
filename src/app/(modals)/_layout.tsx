import { Stack } from "expo-router";
import React from "react";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: "modal", headerTitleStyle: { fontWeight: "700" } }}>
      <Stack.Screen name="planner" options={{ title: "Meal Planner" }} />
    </Stack>
  );
}
