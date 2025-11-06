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

export default function Shopping() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await api.shopping.list();
      setItems(data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addItem = async () => {
    try {
      await api.shopping.create({ name, quantity });
      setName("");
      setQuantity("");
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to add item");
    }
  };

  const remove = async (id: string | number) => {
    try {
      await api.shopping.remove(id);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to remove item");
    }
  };

  return (
    <Screen>
      <View className="p-4 gap-3">
        <Text className="text-xl font-semibold">Add to shopping</Text>
        <Input placeholder="Name (e.g., Tomatoes)" value={name} onChangeText={setName} />
        <Input placeholder="Quantity (e.g., 1 crate)" value={quantity} onChangeText={setQuantity} />
        <Button title="Add" onPress={addItem} />
        {error ? <ErrorView message={error} /> : null}
      </View>
      {loading ? (
        <Loading label="Loading shopping list" />
      ) : items.length === 0 ? (
        <Empty title="No shopping items" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={item.quantity}
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
