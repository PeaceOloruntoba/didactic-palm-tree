import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { OTPInput } from "../../components/ui/OTPInput";
import { useAuth } from "../../store/auth";
import { Screen } from "../../components/layout/Screen";
import { Card } from "../../components/ui/Card";

export default function VerifyOTP() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyOtp, loading, error, clearError } = useAuth();
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    if (!email || code.length < 6) return;
    clearError();
    try {
      await verifyOtp({ email, code });
      router.replace({ pathname: "/(auth)/login", params: { email } });
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
              Verify Email
            </Text>
            <View className="h-1.5 w-12 bg-[#e9be6f] mt-4 mb-2" />
            <Text className="text-slate-500 text-lg font-medium leading-6">
              Check your inbox. We sent a code to: 
              <Text className="text-primary font-bold">{email || "your email"}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <Card className="p-0 bg-transparent border-0 shadow-none gap-6">
            {error && (
              <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-600 text-sm font-bold ml-2 flex-1">{error}</Text>
              </View>
            )}

            <View className="py-4">
              <OTPInput value={code} onChange={setCode} />
            </View>

            <View className="gap-4">
              <Button
                title="Verify Account"
                loading={loading}
                onPress={handleVerify}
                className="h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                textClassName="text-white font-bold text-lg uppercase tracking-widest"
              />

              <Pressable 
                onPress={() => {/* Resend Logic */}} 
                className="items-center py-2"
              >
                <Text className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                  Didn't receive code? <Text className="text-[#e9be6f]">Resend</Text>
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
