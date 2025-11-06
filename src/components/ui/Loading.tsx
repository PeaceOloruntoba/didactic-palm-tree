import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2">
      <ActivityIndicator />
      <Text className="text-gray-500">{label}</Text>
    </View>
  );
}
