import React, { useEffect, useState } from "react";
import { Link, Redirect, router } from "expo-router";
import { Text, View } from "react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function Login() {
  const { login, loading, error, clearError, token, hydrated, bootstrap } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  if (hydrated && token) return <Redirect href="/(app)/dashboard" />;

  return (
    <View className="flex-1 px-4 justify-center gap-4">
      <Text className="text-3xl font-bold mb-2">Welcome back</Text>
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <Input
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Login"
        loading={loading}
        onPress={async () => {
          clearError();
          await login({ email, password })
            .then(() => router.replace("/(app)/dashboard"))
            .catch(() => {});
        }}
      />
      <View className="flex-row justify-between mt-2">
        <Link href="/(auth)/signup">Create account</Link>
        <Link href="/(auth)/forgot-password">Forgot password?</Link>
      </View>
    </View>
  );
}
