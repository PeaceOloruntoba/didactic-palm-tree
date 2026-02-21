import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View, TextInput, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import { Screen } from "../../../components/layout/Screen";
import { Loading } from "../../../components/ui/Loading";
import { ErrorView } from "../../../components/ui/ErrorView";
import { api } from "../../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const PER_PAGE = 20;

export default function Recipes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { items: first, total } = await api.recipesPaged(1, PER_PAGE);
        setItems(Array.isArray(first) ? first : []);
        setTotal(total || first.length);
        setPage(1);
      } catch (e: any) {
        setError("Neural Cookbook sync failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizeUrl = (u?: string | null) => {
    if (!u) return "";
    const s = String(u).trim();
    if (!s) return "";
    return s;
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((r) => r.name.toLowerCase().includes(term));
  }, [q, items]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (items.length >= total) return;
    if (q.trim().length > 0) return; // disable infinite load while searching
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { items: more } = await api.recipesPaged(nextPage, PER_PAGE);
      if (Array.isArray(more) && more.length) {
        setItems((prev) => [...prev, ...more]);
        setPage(nextPage);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, items.length, total, q, page]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { items: first, total } = await api.recipesPaged(1, PER_PAGE);
      setItems(Array.isArray(first) ? first : []);
      setTotal(total || first.length);
      setPage(1);
      setFailed({});
    } finally {
      setRefreshing(false);
    }
  }, []);

  const RecipeCard = useCallback(
    ({ r }: { r: any }) => (
      <Pressable
        onPress={() => router.push(`/(app)/recipes/${r.id}`)}
        className="w-[48%] relative mb-6 rounded-[32px] overflow-hidden bg-white border border-slate-100 shadow-sm shadow-slate-200"
      >
        <View className="h-40 w-full bg-slate-100">
          {!r.image_url || failed[r.id] ? (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="fast-food-outline" size={40} color="#cbd5e1" />
            </View>
          ) : (
            <Image
              source={normalizeUrl(r.image_url)}
              contentFit="cover"
              cachePolicy="disk"
              transition={200}
              style={{ width: "100%", height: "100%" }}
              onError={() => setFailed((prev) => ({ ...prev, [r.id]: true }))}
            />
          )}
        </View>
        <Text className="text-xs text-slate-400 font-bold tracking-widest uppercase absolute top-2 left-2 px-2 py-1 rounded-full bg-[#e9be6f] text-white">
          {r?.category}
        </Text>
        <View className="p-4">
          <Text numberOfLines={2} className="font-black text-sm text-primary uppercase italic leading-tight mb-2">
            {r.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="flame" size={12} color="#fb923c" />
            <Text className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
              {r?.calories} kcal
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [failed]
  );

  if (loading) return <Loading label="Syncing Neural Cookbook..." />;

  return (
    <Screen>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListHeaderComponent={
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
            {filtered.length === 0 ? (
              <View className="py-20 items-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 mt-8">
                <Ionicons name="restaurant-outline" size={48} color="#cbd5e1" />
                <Text className="text-primary font-black text-xl uppercase italic mt-4">
                  No Recipes Found
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: r }) => <RecipeCard r={r} />}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6 items-center">
              <Ionicons name="refresh" size={18} color="#94a3b8" />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}
