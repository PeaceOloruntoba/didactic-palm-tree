import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View, DeviceEventEmitter } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ModalsLayout() {
  return (
    <>
      <StatusBar style="light" translucent={false} backgroundColor="#1f444c" />

      <Stack
        screenOptions={{
          presentation: "modal",
          headerStyle: { backgroundColor: "#1f444c" },
          headerTintColor: "#e9be6f",
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 15,
            color: "#e9be6f",
          },
        }}
      >
        <Stack.Screen
          name="planner"
          options={{
            title: "MEAL PLANNER",
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable onPress={() => DeviceEventEmitter.emit("planner_clear_all")}>
                  <Text style={{ color: "#e9be6f", fontWeight: "900", fontSize: 12 }}>
                    CLEAR ALL
                  </Text>
                </Pressable>
                <Pressable onPress={() => router.back()}>
                  <Ionicons name="close" size={20} color="#e9be6f" />
                </Pressable>
              </View>
            ),
          }}
        />
      </Stack>
    </>
  );
}
