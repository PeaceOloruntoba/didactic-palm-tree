import React from "react";
import { Alert, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View className="p-4 gap-4">
        <Text className="text-2xl font-bold">Settings</Text>
        <View className="rounded-lg border border-gray-200 p-3">
          <Text className="text-gray-500 text-xs mb-1">Signed in as</Text>
          <Text className="text-lg font-semibold">{user?.name || "-"}</Text>
          <Text className="text-gray-700">{user?.email}</Text>
        </View>
        <Button
          title="Logout"
          className="bg-red-600"
          onPress={() => {
            Alert.alert("Logout", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: () => logout() },
            ]);
          }}
        />
        <View className="mt-6">
          <Text className="text-gray-400">v1.0.0</Text>
        </View>
      </View>
    </Screen>
  );
}
