import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function ResetPassword() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 px-4 justify-center gap-4">
      <Text className="text-3xl font-bold mb-2">Reset password</Text>
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <Input placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Input placeholder="Code" keyboardType="number-pad" value={code} onChangeText={setCode} />
      <Input placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button
        title="Update password"
        loading={loading}
        onPress={async () => {
          clearError();
          await resetPassword({ email, code, password }).catch(() => {});
          router.replace({ pathname: "/(auth)/login", params: { email } });
        }}
      />
    </View>
  );
}
