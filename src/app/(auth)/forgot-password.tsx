import React, { useState } from "react";
import { router } from "expo-router";
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

export default function ForgotPassword() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");

  const handleResetRequest = async () => {
    if (!email) return;
    clearError();
    try {
      await forgotPassword({ email });
      router.push({ pathname: "/(auth)/reset-password", params: { email } });
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
        >
          <View className="flex-1 px-6 justify-center bg-white">
            {/* Header Section */}
            <View className="mb-10">
              <Text className="text-5xl font-black text-primary tracking-tighter italic uppercase leading-none">
                Reset Password
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-4 mb-2" />
              <Text className="text-slate-500 text-lg font-medium leading-6">
                Enter your email and we'll send you a recovery code.
              </Text>
            </View>

            {/* Form Card */}
            <Card className="p-0 bg-transparent border-0 shadow-none gap-6">
              {error && (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              )}

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

              <View className="gap-4">
                <Button
                  title="Send reset code"
                  loading={loading}
                  onPress={handleResetRequest}
                  className="h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                  textClassName="text-white font-bold text-lg uppercase tracking-widest"
                />

                <Pressable
                  onPress={() => router.back()}
                  className="flex-row items-center justify-center py-2"
                >
                  <Ionicons name="arrow-back" size={16} color="#94a3b8" />
                  <Text className="text-slate-400 font-bold uppercase tracking-widest text-[11px] ml-2">
                    Back to Login
                  </Text>
                </Pressable>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
