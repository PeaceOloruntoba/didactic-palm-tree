import React from "react";
import { Alert, Text, View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../components/layout/Screen";
import { useAuth } from "../../../store/auth";

export default function Settings() {
  const { user, logout, logoutAll } = useAuth();

  const menuItems = [
    {
      label: "Edit Profile",
      icon: "person-outline",
      href: "/(app)/more/edit-profile",
    },
    {
      label: "Subscription & Billing",
      icon: "card-outline",
      href: "/(app)/more/billing",
    },
    {
      label: "Affiliate Program",
      icon: "share-social-outline",
      href: "/(app)/more/affiliate",
    },
  ];

  const confirmLogout = (all: boolean) => {
    Alert.alert(
      all ? "Logout All Devices" : "Logout",
      all
        ? "This will sign you out of every device currently logged in. Continue?"
        : "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: all ? "Logout All" : "Sign Out",
          style: "destructive",
          onPress: () => (all ? logoutAll() : logout()),
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <View className="px-6 py-8 bg-primary items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-[#2a5d68] items-center justify-center border-2 border-[#e9be6f]">
            <Text className="text-[#e9be6f] text-2xl font-black">
              {user?.first_name?.charAt(0)}
              {user?.last_name?.charAt(0)}
            </Text>
          </View>
          <Text className="text-white text-xl font-black italic uppercase tracking-tighter mt-4">
            {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
              "Bunzi Chef"}
          </Text>
          <Text className="text-slate-400 font-medium text-sm">
            {user?.email}
          </Text>
        </View>

        <View className="p-6">
          {/* Menu Section */}
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
            Account Management
          </Text>

          <View className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
            {menuItems.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.href as any)}
                className={`flex-row items-center p-5 active:bg-slate-100 ${
                  index !== menuItems.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm">
                  <Ionicons name={item.icon as any} size={20} color="#1f444c" />
                </View>
                <Text className="flex-1 ml-4 text-primary font-bold text-base">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </Pressable>
            ))}
          </View>

          {/* Logout Section */}
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mt-10 mb-4 ml-1">
            Security & Session
          </Text>

          <View className="gap-3">
            <Pressable
              onPress={() => confirmLogout(false)}
              className="h-16 rounded-2xl border border-slate-200 flex-row items-center px-5 active:bg-red-50"
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text className="ml-3 text-red-600 font-bold text-base">
                Sign Out
              </Text>
            </Pressable>

            <Pressable
              onPress={() => confirmLogout(true)}
              className="h-16 rounded-2xl bg-red-50 flex-row items-center px-5 active:bg-red-100"
            >
              <Ionicons name="shield-outline" size={20} color="#dc2626" />
              <Text className="ml-3 text-red-700 font-bold text-base">
                Logout All Devices
              </Text>
            </Pressable>
          </View>

          {/* App Info */}
          <View className="mt-12 items-center">
            <View className="h-1 w-8 bg-slate-100 mb-4" />
            <Text className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">
              BunziMeal v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
