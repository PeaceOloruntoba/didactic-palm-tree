import React, { useEffect, useRef, useState } from "react";
import { Text, View, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../components/layout/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { http } from "../../lib/http";

export default function Processing() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reference?: string; status?: string; trxref?: string }>();
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<string>("none");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  useEffect(() => {
    const tick = async () => {
      setTries((t) => t + 1);
      try {
        const { data } = await http.get(`/billing/status`);
        const current =
          data?.subscription?.status ||
          (data?.is_trialing ? "trialing" : data?.is_active ? "active" : "none");
        setStatus(current);
        if (current === "active") {
          stop();
          setDone(true);
          setTimeout(() => {
            router.replace("/(app)/more/billing");
          }, 2500);
        }
      } catch {
        // ignore transient errors
      }
      if (!done && tries > 45) {
        stop();
        setDone(true);
      }
    };
    pollRef.current = setInterval(tick, 4000);
    tick();
    return stop;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen>
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          <Card className="p-5 bg-white border-slate-100 rounded-3xl mb-8">
            <View className="items-center mb-4">
              <View
                className={`w-20 h-20 rounded-3xl items-center justify-center ${
                  done && status === "active" ? "bg-emerald-500" : "bg-slate-50 border border-slate-100"
                }`}
              >
                <Ionicons
                  name={done && status === "active" ? "shield-checkmark" : "refresh"}
                  size={36}
                  color={done && status === "active" ? "white" : "#0ea5e9"}
                />
              </View>
            </View>
            <Text className="text-2xl font-black text-primary uppercase italic text-center">
              {done && status === "active" ? "Verification Clear" : "Securing Access"}
            </Text>
            {!(done && status === "active") ? (
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
            {params?.reference && (
              <View className="mt-4 items-center">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Network Reference Hash
                </Text>
                <Text className="text-[11px] text-primary">{params.reference}</Text>
              </View>
            )}

            <View className="mt-4">
              <Button
                title="Check Status"
                className="h-12 bg-slate-100 rounded-2xl"
                textClassName="text-slate-600 font-bold uppercase tracking-widest"
                onPress={async () => {
                  try {
                    const { data } = await http.get(`/billing/status`);
                    const current =
                      data?.subscription?.status ||
                      (data?.is_trialing ? "trialing" : data?.is_active ? "active" : "none");
                    setStatus(current);
                    if (current === "active") {
                      stop();
                      setDone(true);
                      setTimeout(() => {
                        router.replace("/(app)/more/billing");
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
        </View>
      </ScrollView>
    </Screen>
  );
}

