import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
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

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = activeTab === "shopping" 
        ? await api.shopping.list() 
        : await api.pantry.list();
      setItems(data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab]);

  const handleAdd = async () => {
    if (!name) return Alert.alert("Required", "Item name is required");
    try {
      if (activeTab === "shopping") {
        await api.shopping.create({ name, quantity });
      } else {
        await api.pantry.create({ name, quantity, unit });
      }
      setName("");
      setQuantity("");
      setUnit("");
      load();
    } catch (e: any) {
      Alert.alert("Error", "Failed to add item");
    }
  };

  const handleRemove = async (id: string | number) => {
    try {
      activeTab === "shopping" 
        ? await api.shopping.remove(id) 
        : await api.pantry.remove(id);
      load();
    } catch (e: any) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  return (
    <Screen>
      <View className="flex-1 bg-white">
        {/* Tab Switcher */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row bg-slate-100 p-1 rounded-2xl">
            {(["shopping", "pantry"] as Tab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  activeTab === tab ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text className={`font-black uppercase tracking-widest text-[10px] ${
                  activeTab === tab ? "text-primary" : "text-slate-400"
                }`}>
                  {tab === "shopping" ? "Shopping List" : "My Pantry"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dynamic Add Form */}
        <View className="p-6 gap-3">
          <Input 
            placeholder={activeTab === "shopping" ? "Need to buy..." : "Stocking up on..."}
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
                placeholder="Unit (kg)" 
                value={unit} 
                onChangeText={setUnit}
                className="flex-1 h-14 bg-slate-50 border-slate-100 px-5 rounded-2xl font-bold text-primary"
              />
            )}
            <Pressable 
              onPress={handleAdd}
              className="h-14 w-14 bg-primary items-center justify-center rounded-2xl shadow-lg shadow-primary/20"
            >
              <Ionicons name="add" size={28} color="#e9be6f" />
            </Pressable>
          </View>
          {error && <ErrorView message={error} />}
        </View>

        {/* List Section */}
        <View className="flex-1 px-4">
          <View className="flex-row items-center px-2 mb-4">
             <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400">
                Current Inventory
             </Text>
             <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
          </View>

          {loading && items.length === 0 ? (
            <Loading label={`Opening ${activeTab}...`} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Empty title={`Your ${activeTab} is empty`} subtitle="Add items above to start tracking." />}
              renderItem={({ item }) => (
                <ListItem
                  title={item.name}
                  subtitle={activeTab === "shopping" ? item.quantity : `${item.quantity ?? ""} ${item.unit ?? ""}`.trim()}
                  onDelete={() => handleRemove(item.id)}
                />
              )}
              onRefresh={load}
              refreshing={loading}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}