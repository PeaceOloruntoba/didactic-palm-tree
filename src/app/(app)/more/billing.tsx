import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../components/layout/Screen";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Loading } from "../../../components/ui/Loading";
import { ErrorView } from "../../../components/ui/ErrorView";
import { Card } from "../../../components/ui/Card";
import { http } from "../../../lib/http";

type Plan = {
  plan: "monthly" | "quarterly" | "biannual" | "annual";
  price_cents: number;
  currency?: string;
};

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { data } = await http.get(`/billing/plans`);
        const fetchedPlans = Array.isArray(data?.plans)
          ? data.plans
          : Array.isArray(data)
            ? data
            : [];
        setPlans(fetchedPlans as Plan[]);
      } catch (e: any) {
        setError(e?.response?.data?.errorMessage || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subscribe = async (plan: Plan["plan"]) => {
    try {
      const payload: any = { plan, convert: true };
      if (referral.trim()) payload.referral_code = referral.trim();
      const { data } = await http.post(`/billing/checkout`, payload);

      if (data?.trial_applied) {
        Alert.alert(
          "Trial activated",
          `Your trial has been activated. Enjoy your BunziMeal experience!`,
        );
        return;
      }

      const url = data?.authorization_url || data?.auth_url || data?.url;
      if (url) {
        Linking.openURL(url).catch(() => {
          Alert.alert(
            "Payment",
            "Please complete payment in your browser:\n\n" + url,
          );
        });
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.errorMessage || "Failed to start checkout",
      );
    }
  };

  if (loading) return <Loading label="Consulting architecture..." />;

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">
              Subscription
            </Text>
            <View className="h-1.5 w-12 bg-[#e9be6f] mt-3 mb-2" />
            <Text className="text-slate-500 font-medium leading-5">
              Choose a plan to unlock the full power of your kitchen
              architecture.
            </Text>
          </View>

          {/* Referral Card */}
          <Card className="p-5 bg-slate-50 border-slate-100 rounded-3xl mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons name="gift-outline" size={18} color="#e9be6f" />
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 ml-2">
                Have a Partner Code?
              </Text>
            </View>
            <Input
              placeholder="Enter referral code"
              value={referral}
              onChangeText={setReferral}
              autoCapitalize="characters"
              className="h-14 bg-white border border-slate-200 rounded-2xl px-4 font-bold text-primary"
            />
            <Text className="text-[10px] text-slate-400 mt-3 font-medium leading-3">
              First 100 redemptions on partner codes may unlock exclusive
              benefits and extended trials.
            </Text>
          </Card>

          {error && <ErrorView message={error} />}

          {/* Plans Section */}
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
            Available Plans
          </Text>

          <View className="gap-4">
            {plans.map((p) => {
              const isAnnual = p.plan === "annual";
              return (
                <Pressable
                  key={p.plan}
                  onPress={() => subscribe(p.plan)}
                  className={`p-5 rounded-3xl border-2 flex-row items-center justify-between ${
                    isAnnual
                      ? "border-[#e9be6f] bg-slate-50"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text
                        className={`text-lg font-black uppercase italic ${isAnnual ? "text-primary" : "text-slate-700"}`}
                      >
                        {p.plan}
                      </Text>
                      {isAnnual && (
                        <View className="bg-[#e9be6f] px-2 py-0.5 rounded-md ml-2">
                          <Text className="text-[9px] font-black uppercase text-white">
                            Best Value
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-2xl font-black text-primary">
                      {(p.price_cents / 100).toLocaleString(undefined, {
                        style: "currency",
                        currency: p.currency || "NGN",
                        minimumFractionDigits: 0,
                      })}
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium">
                      Billed {p.plan}
                    </Text>
                  </View>

                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center ${isAnnual ? "bg-[#e9be6f]" : "bg-primary"}`}
                  >
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Secure Payment Note */}
          <View className="mt-10 flex-row items-center justify-center opacity-40">
            <Ionicons name="lock-closed" size={12} color="#94a3b8" />
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
              Secure Checkout via Paystack
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
