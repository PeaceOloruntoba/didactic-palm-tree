import React from "react";
import { View, Text } from "react-native";

export function Empty({ title = "No data", subtitle }: { title?: string; subtitle?: string }) {
  return (
    <View className="items-center justify-center py-16">
      <Text className="text-gray-700 text-base font-medium">{title}</Text>
      {subtitle ? <Text className="text-gray-500 mt-1">{subtitle}</Text> : null}
    </View>
  );
}
