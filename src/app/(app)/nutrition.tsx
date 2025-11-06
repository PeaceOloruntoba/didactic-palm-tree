import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Loading } from "../../components/ui/Loading";
import { Empty } from "../../components/ui/Empty";
import { ErrorView } from "../../components/ui/ErrorView";
import { ListItem } from "../../components/ui/ListItem";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

export default function Nutrition() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [recipeId, setRecipeId] = useState<string>("");
  const [recipes, setRecipes] = useState<{ id: number; name: string }[]>([]);

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const rid = recipeId ? Number(recipeId) : undefined;
      const [data, recs] = await Promise.all([
        api.nutrition(rid),
        api.recipes(),
      ]);
      setItems(data || []);
      setRecipes(recs || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load nutrition");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <View className="p-4 gap-3">
        <Input placeholder="Filter by recipeId (optional)" value={recipeId} onChangeText={setRecipeId} keyboardType="number-pad" />
        <Text className="text-gray-500">Press return to apply filter.</Text>
        {error ? <ErrorView message={error} /> : null}
      </View>
      {loading ? (
        <Loading label="Loading nutrition" />
      ) : items.length === 0 ? (
        <Empty title="No nutrition records" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card className="mx-4 my-2">
              <View className="px-3 py-3">
                <Text className="text-emerald-700 font-semibold mb-1">
                  {`#${item.recipe_id ?? "-"} - ${recipes.find((r) => r.id === item.recipe_id)?.name ?? "-"}`}
                </Text>
                <Text className="text-gray-600">
                  {`Kcal ${item.calories} • P ${item.protein_grams}g • C ${item.carbs_grams}g • F ${item.fat_grams}g`}
                </Text>
              </View>
            </Card>
          )}
          onRefresh={load}
          refreshing={loading}
        />
      )}
    </Screen>
  );
}
