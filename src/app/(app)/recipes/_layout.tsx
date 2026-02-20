import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";

export default function RecipesLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1f444c" translucent={false} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1f444c" },
          headerTintColor: "#e9be6f",
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 15,
            color: "#e9be6f",
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Culinary Library",
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            title: "Recipe Detail",
          }}
        />
      </Stack>
    </>
  );
}
