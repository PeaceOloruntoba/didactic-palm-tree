import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Screen } from "../../../components/layout/Screen";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function Affiliate() {
  const [referralCode, setReferralCode] = useState("");
  const [validateInfo, setValidateInfo] = useState<{
    valid: boolean;
    affiliate?: any;
  } | null>(null);
  const [status, setStatus] = useState<{
    status: string;
    code?: string | null;
  } | null>(null);
  const [pitch, setPitch] = useState("");
  const [social, setSocial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    applied: number;
    code: string | null;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async () => {
    setError(null);
    try {
      const s = await api.referrals
        .status()
        .catch(() => ({ status: "none", code: null }));
      setStatus(s);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to fetch status");
    }
  };

  const loadStats = async () => {
    try {
      const s = await api.referrals.stats();
      setStats(s);
    } catch {}
  };

  useEffect(() => {
    loadStatus();
    loadStats();
  }, []);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Referral code copied to clipboard!");
  };

  const validate = async () => {
    setError(null);
    try {
      const r = await api.referrals.validate(referralCode.trim());
      setValidateInfo(r);
    } catch (e: any) {
      setValidateInfo(null);
      setError(e?.response?.data?.error || "Invalid code");
    }
  };

  const redeem = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.referrals.redeem(referralCode.trim());
      Alert.alert("Success", "Referral applied to your account");
      loadStatus();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to redeem");
    } finally {
      setLoading(false);
    }
  };

  const requestAffiliate = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.referrals.request({
        pitch,
        social_links: social ? { links: [social] } : undefined,
      });
      Alert.alert("Request sent", "We will review and notify you by email");
      loadStatus();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const activeCode = status?.code || stats?.code || null;
  const referralLink = activeCode ? `https://bunzi-mealplanner.vercel.app/signup?referralId=${activeCode}` : null;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="bg-white"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await Promise.all([loadStatus(), loadStats()]);
                setRefreshing(false);
              }}
              tintColor="#1f444c"
            />
          }
        >
          <View className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">
                Affiliate
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-3 mb-2" />
              <Text className="text-slate-500 font-medium leading-5">
                Manage rewards, track redemptions, and scale your influence.
              </Text>
            </View>

            {error && (
              <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center mb-6">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                  {error}
                </Text>
              </View>
            )}

            {/* Redeem Section */}
            <Card className="p-5 bg-slate-50 border-slate-100 rounded-3xl mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="gift-outline" size={18} color="#e9be6f" />
                <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-500 ml-2">
                  Partner Code
                </Text>
              </View>
              <Input
                placeholder="ABC1234"
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                className="h-14 bg-white border border-slate-200 rounded-2xl px-5 font-bold text-primary"
              />
              <View className="flex-row gap-3 mt-4">
                <Button
                  title="Validate"
                  onPress={validate}
                  className="flex-1 h-12 bg-white border-2 border-primary rounded-2xl"
                  textClassName="text-primary font-bold text-xs uppercase"
                />
                <Button
                  title="Redeem"
                  onPress={redeem}
                  loading={loading}
                  className="flex-1 h-12 bg-primary rounded-2xl"
                  textClassName="text-white font-bold text-xs uppercase"
                />
              </View>

              {validateInfo && (
                <View className="mt-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        validateInfo.valid ? "checkmark-circle" : "close-circle"
                      }
                      size={16}
                      color={validateInfo.valid ? "#10b981" : "#ef4444"}
                    />
                    <Text
                      className={`font-bold text-sm ml-2 ${validateInfo.valid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {validateInfo.valid
                        ? "Valid Referral Code"
                        : "Invalid Referral Code"}
                    </Text>
                  </View>
                  {validateInfo.affiliate && (
                    <Text className="text-slate-500 text-xs mt-1 font-medium">
                      Benefit: {validateInfo.affiliate.benefit} (
                      {validateInfo.affiliate.benefit_value}%)
                    </Text>
                  )}
                </View>
              )}
            </Card>

            {/* Stats Dashboard */}
            <View className="mb-8">
              <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
                Performance Stats
              </Text>

              {referralLink && (
                <Card className="p-5 bg-primary rounded-3xl mb-4 shadow-lg shadow-primary/20 border-0">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                        Your Referral Link
                      </Text>
                      <Text className="text-[#e9be6f] text-sm font-bold mt-1">
                        {referralLink}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => copyToClipboard(referralLink)}
                      className="h-10 w-10 bg-white/10 items-center justify-center rounded-xl"
                    >
                      <Ionicons name="copy-outline" size={20} color="#e9be6f" />
                    </Pressable>
                  </View>
                </Card>
              )}

              <View className="flex-row gap-4">
                <View className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 p-5">
                  <Ionicons name="people-outline" size={20} color="#1f444c" />
                  <Text className="text-primary font-black text-3xl mt-2">
                    {stats?.total ?? 0}
                  </Text>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Total
                  </Text>
                </View>
                <View className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 p-5">
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="#e9be6f"
                  />
                  <Text className="text-primary font-black text-3xl mt-2">
                    {stats?.applied ?? 0}
                  </Text>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Applied
                  </Text>
                </View>
              </View>
            </View>

            {/* Request Program */}
            <View className="mb-6">
              <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
                Program Access
              </Text>
              <Card className="p-6 bg-slate-50 border-slate-100 rounded-3xl">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-primary font-bold text-lg">
                    Partner Program
                  </Text>
                  <View className="bg-primary/5 px-3 py-1 rounded-full">
                    <Text className="text-primary text-[10px] font-black uppercase italic tracking-widest">
                      {status?.status || "inactive"}
                    </Text>
                  </View>
                </View>

                <View className="gap-4">
                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">
                      The Pitch
                    </Text>
                    <Input
                      placeholder="Describe your audience..."
                      value={pitch}
                      onChangeText={setPitch}
                      multiline
                      className="h-32 bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-primary"
                    />
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">
                      Social Hub
                    </Text>
                    <Input
                      placeholder="https://social.link/user"
                      value={social}
                      onChangeText={setSocial}
                      autoCapitalize="none"
                      className="h-14 bg-white border border-slate-200 rounded-2xl px-5 font-semibold text-primary"
                    />
                  </View>
                  <Button
                    title="Apply for Program"
                    onPress={requestAffiliate}
                    loading={loading}
                    className="h-16 bg-primary rounded-2xl shadow-lg shadow-primary/10 mt-2"
                    textClassName="text-white font-bold uppercase tracking-widest"
                  />
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
