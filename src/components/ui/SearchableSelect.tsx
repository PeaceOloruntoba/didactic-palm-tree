import React, { useEffect, useMemo, useState, memo } from "react";
import {
  Pressable,
  Text,
  View,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Option = { id: number | string; name: string };

type Props = {
  options: Option[];
  value: Option | null | undefined;
  onChange: (opt: Option | null) => void;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// We use React.memo to prevent this component from re-rendering
// unless its specific value or open state changes.
export const SearchableSelect = memo(
  ({ options, value, onChange, placeholder, open, onOpenChange }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => {
      const term = searchQuery.trim().toLowerCase();
      if (!term) return options;
      return options.filter((o) => o.name.toLowerCase().includes(term));
    }, [searchQuery, options]);

    useEffect(() => {
      if (!open) setSearchQuery("");
    }, [open]);

    return (
      <View>
        <Pressable
          onPress={() => onOpenChange?.(true)}
          className="h-16 rounded-2xl bg-slate-50 px-5 flex-row items-center justify-between border border-slate-100"
        >
          <Text
            numberOfLines={1}
            className={`font-bold text-base flex-1 mr-2 ${value ? "text-primary" : "text-slate-300"}`}
          >
            {value?.name || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#94a3b8" />
        </Pressable>

        <Modal
          visible={open}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => onOpenChange?.(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => onOpenChange?.(false)}
            />

            <View style={styles.bottomSheet}>
              <View className="items-center py-4">
                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </View>

              <View className="mb-4">
                <Text className="text-xl font-black text-primary uppercase italic tracking-tighter">
                  Select Recipe
                </Text>
              </View>

              <View className="relative justify-center mb-4">
                <TextInput
                  placeholder="Search blueprints..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="h-14 bg-slate-50 rounded-2xl px-12 font-bold text-primary border border-slate-100"
                  autoFocus={false}
                />
                <View className="absolute left-4">
                  <Ionicons name="search" size={18} color="#94a3b8" />
                </View>
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    className="absolute right-4"
                  >
                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                  </Pressable>
                )}
              </View>

              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      No matches found
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = value?.id === item.id;
                  return (
                    <Pressable
                      onPress={() => {
                        onChange(item);
                        onOpenChange?.(false);
                      }}
                      className={`flex-row items-center p-5 mb-2 rounded-2xl border ${
                        isSelected
                          ? "bg-slate-50 border-[#e9be6f]"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`text-base font-bold ${isSelected ? "text-primary" : "text-slate-600"}`}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          Architecture ID: {item.id}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#e9be6f"
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  },
  (prev, next) => {
    // Only re-render if the essential props change
    return (
      prev.value?.id === next.value?.id &&
      prev.open === next.open &&
      prev.options.length === next.options.length
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    maxHeight: "85%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
});
