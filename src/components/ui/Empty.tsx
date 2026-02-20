import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Empty({
  title = "No data",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <View className="items-center justify-center py-20 px-10">
      <View className="h-20 w-20 bg-slate-50 rounded-full items-center justify-center mb-4">
        <Ionicons name="search-outline" size={32} color="#cbd5e1" />
      </View>
      <Text className="text-primary text-lg font-black italic uppercase tracking-tighter text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-slate-400 text-center font-medium mt-2 leading-5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
