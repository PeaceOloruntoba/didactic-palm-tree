import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
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
              onPress={() => setConfirmOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-xl active:bg-red-50"
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </Pressable>
          )}
        </Pressable>
      </View>

      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 p-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning-outline" size={18} color="#ef4444" />
              <Text className="ml-2 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                Confirm Delete
              </Text>
            </View>
            <Text className="text-primary font-black italic uppercase tracking-tighter mb-4">
              {title}
            </Text>
            <View className="flex-row gap-3">
              <Button
                title="Cancel"
                onPress={() => setConfirmOpen(false)}
                className="flex-1 h-12 bg-slate-100 rounded-2xl"
                textClassName="text-slate-600 font-bold uppercase tracking-widest"
              />
              <Button
                title="Delete"
                onPress={() => {
                  setConfirmOpen(false);
                  onDelete?.();
                }}
                className="flex-1 h-12 bg-red-500 rounded-2xl"
                textClassName="text-white font-bold uppercase tracking-widest"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
