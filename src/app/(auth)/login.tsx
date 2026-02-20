import React, { useEffect, useState } from "react";
import { Link, Redirect, router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function Login() {
  const { login, loading, error, clearError, token, hydrated, bootstrap } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!hydrated) bootstrap();
  }, [hydrated]);

  if (hydrated && token) return <Redirect href="/(app)/dashboard" />;

  const handleLogin = async () => {
    clearError();
    try {
      await login({ email, password });
      router.replace("/(app)/dashboard");
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
        <View className="flex-1 px-6 justify-center bg-white">
          {/* Header Section */}
          <View className="mb-10">
            <Text className="text-5xl font-black text-primary tracking-tighter italic uppercase leading-none">
              Welcome back
            </Text>
            <View className="h-1.5 w-12 bg-[#e9be6f] mt-4 mb-2" />
            <Text className="text-slate-500 text-lg font-medium leading-6">
              Log in to manage your kitchen architecture.
            </Text>
          </View>

          {/* Form Card */}
          <Card className="p-0 bg-transparent border-0 shadow-none gap-5">
            {error && (
              <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                  {error}
                </Text>
              </View>
            )}

            <View className="gap-4">
              {/* Email Input */}
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                  Email Address
                </Text>
                <Input
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                />
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                  Password
                </Text>
                <View className="relative justify-center">
                  <Input
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    className="h-16 rounded-2xl bg-slate-50 px-5 pr-14 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                  />
                  <Pressable
                    className="absolute right-0 h-16 w-14 items-center justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#94a3b8"
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Login Action */}
            <View className="mt-4">
              <Button
                title="Sign In"
                loading={loading}
                onPress={handleLogin}
                className="h-16 rounded-2xl bg-primary flex flex-row items-center justify-center shadow-lg shadow-primary/20"
                textClassName="text-white font-bold text-lg uppercase tracking-widest"
              />
            </View>

            {/* Footer Links */}
            <View className="flex-row justify-between items-center mt-4 px-1">
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text className="text-[#e9be6f] font-bold text-[20px]">
                    Create account
                  </Text>
                </Pressable>
              </Link>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable>
                  <Text className="text-slate-400 font-semibold text-[15px]">
                    Forgot password?
                  </Text>
                </Pressable>
              </Link>
            </View>
          </Card>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
