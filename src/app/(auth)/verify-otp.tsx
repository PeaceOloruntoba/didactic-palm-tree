import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { OTPInput } from "../../components/ui/OTPInput";
import { useAuth } from "../../store/auth";

export default function VerifyOTP() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyOtp, loading, error, clearError } = useAuth();
  const [code, setCode] = useState("");

  return (
    <View className="flex-1 px-4 justify-center gap-4">
      <Text className="text-3xl font-bold mb-2">Verify your email</Text>
      {email ? <Text className="text-gray-500">{email}</Text> : null}
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <OTPInput value={code} onChange={setCode} />
      <Button
        title="Verify"
        loading={loading}
        onPress={async () => {
          if (!email) return;
          clearError();
          await verifyOtp({ email, code }).catch(() => {});
          router.replace({ pathname: "/(auth)/login", params: { email } });
        }}
      />
    </View>
  );
}
