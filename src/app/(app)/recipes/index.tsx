import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View, TextInput, Image, Pressable, FlatList } from "react-native";
import { Screen } from "../../../components/layout/Screen";
import { Loading } from "../../../components/ui/Loading";
import { ErrorView } from "../../../components/ui/ErrorView";
import { api } from "../../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Recipes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const recs = await api.recipes();
        setItems(Array.isArray(recs) ? recs : []);
      } catch (e: any) {
        setError("Neural Cookbook sync failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((r) => r.name.toLowerCase().includes(term));
  }, [q, items]);

  if (loading) return <Loading label="Syncing Neural Cookbook..." />;

  return (
    <Screen>
      <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header & Search */}
          <View className="mb-8">
            <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">
              Discover <Text className="text-[#e9be6f]">Flavors</Text>
            </Text>
            <View className="h-1.5 w-12 bg-[#e9be6f] mt-3 mb-6" />

            <View className="flex-row items-center px-5 h-16 rounded-2xl bg-slate-50 border border-slate-100">
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                placeholder="Search ingredients or meals..."
                value={q}
                onChangeText={setQ}
                className="ml-3 flex-1 text-primary font-bold text-base"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {filtered.length === 0 ? (
            <View className="py-20 items-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Ionicons name="restaurant-outline" size={48} color="#cbd5e1" />
              <Text className="text-primary font-black text-xl uppercase italic mt-4">
                No Recipes Found
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              numColumns={2}
              keyExtractor={(item) => String(item.id)}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item: r }) => (
                <Pressable
                  onPress={() => router.push(`/(app)/recipes/${r.id}`)}
                  className="w-[48%] mb-6 rounded-[32px] overflow-hidden bg-white border border-slate-100 shadow-sm shadow-slate-200"
                >
                  <View className="h-40 w-full bg-slate-100">
                    {r.image_url ? (
                      <Image source={{ uri: r.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons name="fast-food-outline" size={40} color="#cbd5e1" />
                      </View>
                    )}
                  </View>
                  <View className="p-4">
                    <Text numberOfLines={2} className="font-black text-sm text-primary uppercase italic leading-tight mb-2">
                      {r.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="flame" size={12} color="#fb923c" />
                      <Text className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                        {typeof r.calories === "number" ? r.calories : 0} kcal
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
