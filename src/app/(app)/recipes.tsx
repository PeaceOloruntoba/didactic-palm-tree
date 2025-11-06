import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Loading } from "../../components/ui/Loading";
import { Empty } from "../../components/ui/Empty";
import { ErrorView } from "../../components/ui/ErrorView";
import { ListItem } from "../../components/ui/ListItem";
import { api } from "../../lib/api";

export default function Recipes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [recipes, setRecipes] = useState<{ id: number; name: string; category?: string }[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.recipes();
        setRecipes(data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(term));
  }, [q, recipes]);

  return (
    <Screen>
      <View className="p-4 gap-3">
        <Input placeholder="Search recipes" value={q} onChangeText={setQ} />
        {error ? <ErrorView message={error} /> : null}
      </View>
      {loading ? (
        <Loading label="Loading recipes" />
      ) : filtered.length === 0 ? (
        <Empty title="No recipes" subtitle={q ? "Try a different search" : undefined} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem title={item.name} subtitle={item.category} />
          )}
        />
      )}
    </Screen>
  );
}
