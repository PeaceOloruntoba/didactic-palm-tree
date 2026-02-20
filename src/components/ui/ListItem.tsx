import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ListItemProps = {
  title: string;
  subtitle?: string;
  onDelete?: () => void;
  onPress?: () => void;
};

export function ListItem({
  title,
  subtitle,
  onDelete,
  onPress,
}: ListItemProps) {
  return (
    <View className="mb-3 bg-white border border-slate-50 rounded-2xl shadow-sm shadow-slate-200 overflow-hidden">
      <Pressable
        onPress={onPress}
        className="flex-row items-center p-4 active:bg-slate-50"
      >
        <View className="h-10 w-10 rounded-xl bg-slate-50 items-center justify-center">
          <Ionicons name="restaurant-outline" size={18} color="#1f444c" />
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-base font-bold text-primary italic uppercase tracking-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs font-semibold text-slate-400 mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onDelete && (
          <Pressable
            onPress={onDelete}
            className="h-10 w-10 items-center justify-center rounded-xl active:bg-red-50"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}
