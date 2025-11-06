import React, { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";

export function ListItem({ title, subtitle, right, onPress }: PropsWithChildren<{ title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }>) {
  return (
    <Pressable onPress={onPress} className="px-4 py-3 border-b border-gray-100 active:bg-gray-50">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{title}</Text>
          {subtitle ? <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </Pressable>
  );
}
