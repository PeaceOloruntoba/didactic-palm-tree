import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { Empty } from "../../components/ui/Empty";
import { ErrorView } from "../../components/ui/ErrorView";
import { ListItem } from "../../components/ui/ListItem";
import { api } from "../../lib/api";

export default function Pantry() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await api.pantry.list();
      setItems(data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load pantry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addItem = async () => {
    try {
      await api.pantry.create({ name, quantity, unit });
      setName("");
      setQuantity("");
      setUnit("");
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to add item");
    }
  };

  const remove = async (id: string | number) => {
    try {
      await api.pantry.remove(id);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to remove item");
    }
  };

  return (
    <Screen>
      <View className="p-4 gap-3">
        <Text className="text-xl font-semibold">Add pantry item</Text>
        <Input placeholder="Name (e.g., Rice)" value={name} onChangeText={setName} />
        <View className="flex-row gap-2">
          <Input className="flex-1" placeholder="Quantity" value={quantity} onChangeText={setQuantity} />
          <Input className="flex-1" placeholder="Unit (e.g., kg)" value={unit} onChangeText={setUnit} />
        </View>
        <Button title="Add" onPress={addItem} />
        {error ? <ErrorView message={error} /> : null}
      </View>
      {loading ? (
        <Loading label="Loading pantry" />
      ) : items.length === 0 ? (
        <Empty title="No pantry items" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={`${item.quantity ?? ""} ${item.unit ?? ""}`.trim()}
              right={<Text className="text-red-500" onPress={() => remove(item.id)}>Remove</Text>}
            />
          )}
          onRefresh={load}
          refreshing={loading}
        />
      )}
    </Screen>
  );
}
