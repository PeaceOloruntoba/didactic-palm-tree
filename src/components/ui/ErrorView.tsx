import React from "react";
import { View, Text } from "react-native";

export function ErrorView({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View className="rounded-md border border-red-300 bg-red-50 p-3">
      <Text className="text-red-600">{message}</Text>
    </View>
  );
}
