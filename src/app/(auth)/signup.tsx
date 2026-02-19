import React, { useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function Signup() {
  const { register, loading, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const params = useLocalSearchParams<{ referralId?: string; ref?: string }>();

  useEffect(() => {
    const ref = (params.referralId as string) || (params.ref as string) || "";
    if (ref) setReferral(ref);
  }, [params.referralId, params.ref]);

  return (
    <View className="flex-1 px-4 justify-center gap-4">
      <Text className="text-3xl font-bold mb-2">Create account</Text>
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Input placeholder="Referral code (optional)" value={referral} onChangeText={setReferral} />
      <Button
        title="Sign up"
        loading={loading}
        onPress={async () => {
          clearError();
          const res = await register({ email, password, name, referral_code: referral.trim() || undefined } as any);
          if (res) router.push({ pathname: "/(auth)/verify-otp", params: { email } });
        }}
      />
      <View className="flex-row justify-between mt-2">
        <Link href="/(auth)/login">Have an account? Login</Link>
      </View>
    </View>
  );
}
