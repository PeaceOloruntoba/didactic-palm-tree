import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function ResetPassword() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { resetPassword, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!email || !code || !password) return;
    clearError();
    try {
      await resetPassword({ email, code, password });
      router.replace({ pathname: "/(auth)/login", params: { email } });
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center bg-white py-10">
            {/* Header Section */}
            <View className="mb-8">
              <Text className="text-5xl font-black text-primary tracking-tighter italic uppercase leading-none">
                Create New Password
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-4 mb-2" />
              <Text className="text-slate-500 text-lg font-medium leading-6">
                Enter the code sent to your email and set your new security
                credentials.
              </Text>
            </View>

            {/* Form Card */}
            <Card className="p-0 bg-transparent border-0 shadow-none gap-4">
              {error && (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              )}

              <View className="gap-4">
                {/* Email Field */}
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                    Verify Email
                  </Text>
                  <Input
                    placeholder="Email address"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                  />
                </View>

                {/* Reset Code Field */}
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                    Reset Code
                  </Text>
                  <Input
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                    className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                  />
                </View>

                {/* New Password Field */}
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                    New Password
                  </Text>
                  <View className="relative justify-center">
                    <Input
                      placeholder="Minimum 8 characters"
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

              {/* Action Button */}
              <View className="mt-4">
                <Button
                  title="Update Password"
                  loading={loading}
                  onPress={handleUpdatePassword}
                  className="h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                  textClassName="text-white font-bold text-lg uppercase tracking-widest"
                />
              </View>

              <Pressable
                onPress={() => router.replace("/(auth)/login")}
                className="items-center py-2"
              >
                <Text className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                  Remembered your password?{" "}
                  <Text className="text-[#e9be6f]">Sign In</Text>
                </Text>
              </Pressable>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
