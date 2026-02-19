import { Tabs, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "../../store/auth";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AppTabsLayout() {
  const { token, hydrated, bootstrap } = useAuth();

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  if (hydrated && !token) return <Redirect href="/(auth)/login" />;

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleStyle: { fontWeight: "700" },
        headerStyle: { backgroundColor: "#1f444c" },
        headerTintColor: "#e9be6f",
        tabBarActiveTintColor: "#e9be6f",
        tabBarInactiveTintColor: "#c77138",
        tabBarStyle: { paddingTop: 4, height: 60, backgroundColor: "#1f444c", borderTopColor: "#16333a" },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            dashboard: "home-outline",
            recipes: "restaurant-outline",
            shopping: "cart-outline",
            pantry: "bag-outline",
            billing: "card-outline",
            settings: "settings-outline",
          };
          const name = map[route.name] || "ellipse-outline";
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => router.push("/(modals)/planner")}
                style={{ paddingHorizontal: 8 }}
                accessibilityLabel="Open planner"
              >
                <Ionicons name="calendar-outline" size={22} color="#e9be6f" />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="ai" options={{ title: "AI" }} />
      <Tabs.Screen name="recipes" options={{ title: "Recipes" }} />
      <Tabs.Screen name="shopping" options={{ title: "Shopping" }} />
      <Tabs.Screen name="pantry" options={{ title: "Pantry" }} />
      <Tabs.Screen name="billing" options={{ title: "Billing" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </>
  );
}
