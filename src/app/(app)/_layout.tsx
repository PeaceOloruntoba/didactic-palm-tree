import { Tabs, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "../../store/auth";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppTabsLayout() {
  const { token, hydrated, bootstrap } = useAuth();

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  if (!hydrated) return null;
  if (hydrated && !token) return <Redirect href="/(auth)/login" />;

  useEffect(() => {
    let mounted = true;
    const checkPaywall = async () => {
      try {
        const reason = await AsyncStorage.getItem("paywall_reason");
        if (mounted && reason) {
          await AsyncStorage.removeItem("paywall_reason");
          setTimeout(() => router.replace("/(app)/more/billing"), 0);
        }
      } catch {}
    };
    checkPaywall();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#1f444c",
          },
          headerTitleStyle: {
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            fontSize: 15,
            fontStyle: "italic",
            color: "#e9be6f",
          },
          tabBarActiveTintColor: "#e9be6f",
          tabBarInactiveTintColor: "rgba(233, 190, 111, 0.4)", // Faded version of your gold
          tabBarStyle: {
            height: 85,
            backgroundColor: "#1f444c",
            borderTopWidth: 1,
            borderTopColor: "#2a5d68",
            paddingTop: 10,
            paddingBottom: 25,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
            headerRight: () => (
              <Pressable
                onPress={() => router.push("/(modals)/planner")}
                className="mr-5 h-9 w-9 items-center justify-center rounded-lg border border-[#e9be6f]/20"
              >
                <Ionicons name="calendar-outline" size={18} color="#e9be6f" />
              </Pressable>
            ),
          }}
        />

        <Tabs.Screen
          name="ai"
          options={{
            title: "Bunzi AI",
            tabBarLabel: "AI Chat",
            tabBarIcon: ({ color }) => (
              <Ionicons name="sparkles-outline" size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="recipes"
          options={{
            headerShown: false,
            title: "Recipes",
            tabBarLabel: "Recipes",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="shopping"
          options={{
            title: "Kitchen",
            tabBarLabel: "Pantry",
            tabBarIcon: ({ color }) => (
              <Ionicons name="basket-outline" size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="more"
          options={{
            headerShown: false,
            title: "More",
            tabBarLabel: "More",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
