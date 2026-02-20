import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/Empty";
import { ErrorView } from "../../components/ui/ErrorView";
import { ListItem } from "../../components/ui/ListItem";
import { api } from "../../lib/api";

type Tab = "shopping" | "pantry";

export default function KitchenScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("shopping");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  // Memoized load function to prevent unnecessary recreations
  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(undefined);
      try {
        const data =
          activeTab === "shopping"
            ? await api.shopping.list()
            : await api.pantry.list();
        setItems(data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || `Failed to load ${activeTab}`);
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!name.trim())
      return Alert.alert("Required", "Please enter an item name.");

    setLoading(true);
    try {
      if (activeTab === "shopping") {
        await api.shopping.create({ name, quantity });
      } else {
        await api.pantry.create({ name, quantity, unit });
      }
      setName("");
      setQuantity("");
      setUnit("");
      // Reload without the full-screen spinner for better UX
      await load(false);
    } catch (e: any) {
      Alert.alert("Error", "Failed to add item. Please try again.");
      setLoading(false);
    }
  };

  const handleRemove = async (id: string | number) => {
    try {
      activeTab === "shopping"
        ? await api.shopping.remove(id)
        : await api.pantry.remove(id);
      // Optimistic update or quick reload
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      Alert.alert("Error", "Failed to remove item.");
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1 bg-white">
          {/* Custom Segmented Control */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row bg-slate-100 p-1.5 rounded-2xl">
              <Pressable
                onPress={() => {
                  if (activeTab !== "shopping") setActiveTab("shopping");
                }}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === "shopping" ? "bg-white shadow-sm" : ""} ${loading ? "opacity-60" : ""}`}
              >
                <Text
                  className={`font-black uppercase tracking-widest text-[10px] ${activeTab === "shopping" ? "text-primary" : "text-slate-400"}`}
                >
                  Shopping List
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (activeTab !== "pantry") setActiveTab("pantry");
                }}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === "pantry" ? "bg-white shadow-sm" : ""} ${loading ? "opacity-60" : ""}`}
              >
                <Text
                  className={`font-black uppercase tracking-widest text-[10px] ${activeTab === "pantry" ? "text-primary" : "text-slate-400"}`}
                >
                  My Pantry
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Add Form */}
          <View className="p-6 gap-3">
            <Input
              placeholder={
                activeTab === "shopping"
                  ? "What do you need?"
                  : "What's in the kitchen?"
              }
              value={name}
              onChangeText={setName}
              className="h-14 bg-slate-50 border-slate-100 px-5 rounded-2xl font-bold text-primary"
            />
            <View className="flex-row gap-3">
              <Input
                placeholder="Qty"
                value={quantity}
                onChangeText={setQuantity}
                className="flex-1 h-14 bg-slate-50 border-slate-100 px-5 rounded-2xl font-bold text-primary"
              />
              {activeTab === "pantry" && (
                <Input
                  placeholder="Unit"
                  value={unit}
                  onChangeText={setUnit}
                  className="flex-1 h-14 bg-slate-50 border-slate-100 px-5 rounded-2xl font-bold text-primary"
                />
              )}
              <Pressable
                onPress={handleAdd}
                disabled={loading}
                className="h-14 w-14 bg-primary items-center justify-center rounded-2xl shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <ActivityIndicator color="#e9be6f" size="small" />
                ) : (
                  <Ionicons name="add" size={28} color="#e9be6f" />
                )}
              </Pressable>
            </View>
            {error && <ErrorView message={error} />}
          </View>

          {/* List Content */}
          <FlatList
            data={items}
            key={activeTab}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 120,
            }}
            ListHeaderComponent={
              <View className="flex-row items-center mb-4">
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400">
                  {activeTab === "shopping" ? "To Buy" : "In Stock"}
                </Text>
                <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
              </View>
            }
            ListEmptyComponent={
              !loading ? (
                <Empty
                  title={`${activeTab === "shopping" ? "Empty List" : "Empty Pantry"}`}
                  subtitle={`Start building your kitchen architecture by adding items above.`}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <ListItem
                title={item.name}
                subtitle={
                  activeTab === "shopping"
                    ? item.quantity
                    : `${item.quantity ?? ""} ${item.unit ?? ""}`.trim()
                }
                onDelete={() => handleRemove(item.id)}
              />
            )}
            onRefresh={() => load(false)}
            refreshing={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
