import React, { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function ForgotPassword() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <View className="flex-1 px-4 justify-center gap-4">
      <Text className="text-3xl font-bold mb-2">Forgot password</Text>
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <Input
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title="Send reset code"
        loading={loading}
        onPress={async () => {
          clearError();
          await forgotPassword({ email }).catch(() => {});
          router.push({ pathname: "/(auth)/reset-password", params: { email } });
        }}
      />
    </View>
  );
}
