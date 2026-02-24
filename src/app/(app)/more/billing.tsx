import React, { useEffect, useRef, useState } from "react";
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
  const [processing, setProcessing] = useState(false);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<any>(null);

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
        try {
          const s = await http.get(`/billing/status`);
          setStatus(s.data);
        } catch {}
      } catch (e: any) {
        setError(e?.response?.data?.errorMessage || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subscribe = async (plan: Plan["plan"]) => {
    try {
      const payload: any = {
        plan,
        convert: true,
        // Deep link back into the app; Paystack will append ?reference=... automatically
        callback_url: "bunzimeal://billing/processing",
      };
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
        setProcessing(true);
        setDone(false);
        setTries(0);
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
        pollRef.current = setInterval(async () => {
          setTries((t) => t + 1);
          try {
            const { data: statusData } = await http.get(`/billing/status`);
            const current =
              statusData?.subscription?.status ||
              (statusData?.is_trialing
                ? "trialing"
                : statusData?.is_active
                ? "active"
                : "none");
            if (current === "active") {
              if (pollRef.current) clearInterval(pollRef.current);
              setDone(true);
              setTimeout(() => {
                setProcessing(false);
                setDone(false);
              }, 2500);
            }
          } catch {
            // ignore
          }
          if (!done && tries > 45) {
            if (pollRef.current) clearInterval(pollRef.current);
            setDone(true);
          }
        }, 4000);
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

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (loading) return <Loading label="Consulting architecture..." />;

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {processing && (
            <Card className="p-5 bg-white border-slate-100 rounded-3xl mb-8">
              <View className="items-center mb-4">
                <View className={`w-20 h-20 rounded-3xl items-center justify-center ${done ? "bg-emerald-500" : "bg-slate-50 border border-slate-100"}`}>
                  <Ionicons
                    name={done ? "shield-checkmark" : "refresh"}
                    size={36}
                    color={done ? "white" : "#0ea5e9"}
                  />
                </View>
              </View>
              <Text className="text-2xl font-black text-primary uppercase italic text-center">
                {done ? "Verification Clear" : "Securing Access"}
              </Text>
              {!done ? (
                <View className="items-center mt-2">
                  <Text className="text-slate-500 font-medium text-center">
                    We are synchronizing your credentials with the payment network.
                  </Text>
                  <View className="flex-row items-center gap-2 mt-3">
                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Cycle {tries} of 45
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-emerald-600 font-bold uppercase tracking-[2px] text-center mt-2">
                  Transaction Validated. Welcome to Premium.
                </Text>
              )}
              {!done && (
                <View className="flex-row items-center justify-center gap-2 mt-4">
                  <View className="w-1 h-1 rounded-full bg-rose-400" />
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                    Maintain active connection — Do not close
                  </Text>
                </View>
              )}
              <View className="mt-4">
                <Button
                  title="Check Status"
                  className="h-12 bg-slate-100 rounded-2xl"
                  textClassName="text-slate-600 font-bold uppercase tracking-widest"
                  onPress={async () => {
                    try {
                      const { data: statusData } = await http.get(`/billing/status`);
                      const current =
                        statusData?.subscription?.status ||
                        (statusData?.is_trialing
                          ? "trialing"
                          : statusData?.is_active
                          ? "active"
                          : "none");
                      if (current === "active") {
                        setDone(true);
                        if (pollRef.current) clearInterval(pollRef.current);
                        setTimeout(() => {
                          setProcessing(false);
                          setDone(false);
                        }, 2500);
                      } else {
                        Alert.alert("Still processing", "We haven't received confirmation yet. We'll keep checking.");
                      }
                    } catch {
                      Alert.alert("Error", "Failed to check status");
                    }
                  }}
                />
              </View>
            </Card>
          )}
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
          {/* Current Status Badge */}
          {status && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      (status?.subscription?.status || status?.is_active) ? "bg-emerald-500" : status?.is_trialing ? "bg-sky-500" : "bg-slate-300"
                    }`}
                  />
                  <Text className="text-slate-600 font-bold">
                    Status:{" "}
                    <Text className="text-primary uppercase">
                      {(status?.subscription?.status ||
                        (status?.is_trialing
                          ? "trialing"
                          : status?.is_active
                          ? "active"
                          : "none")) as string}
                    </Text>
                  </Text>
                </View>
                {!!(status?.subscription?.current_period_end || status?.next_billing_date) && (
                  <View className="px-3 py-1 rounded-xl bg-white border border-slate-200">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Renewal{" "}
                      {new Date(
                        status?.subscription?.current_period_end ||
                          status?.next_billing_date,
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

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
