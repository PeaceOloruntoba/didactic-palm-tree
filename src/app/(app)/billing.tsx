import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { Card } from "../../components/ui/Card";
import { http } from "../../lib/http";

type Plan = { plan: "monthly" | "quarterly" | "biannual" | "annual"; price_cents: number; currency?: string };
type CountryPlan = { is_active: boolean; country: { id: number; currency: string }; plans: Plan[] };

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError(undefined);
      try {
        const { data } = await http.get(`/billing/plans`);
        if (data?.plans && Array.isArray(data.plans)) {
          setPlans(data.plans as Plan[]);
        } else {
          setPlans((data as Plan[]) || []);
        }
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
        Alert.alert("Trial activated", `Your trial has been activated.`);
        return;
      }
      const url = data?.authorization_url || data?.auth_url || data?.url;
      if (url) {
        Linking.openURL(url).catch(() => {
          Alert.alert("Payment", "Open this link in your browser:\n" + url);
        });
      } else {
        Alert.alert("Payment", "Checkout initialized. We'll update your status shortly.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.errorMessage || "Failed to start checkout");
    }
  };

  if (loading) return <Loading label="Loading billing" />;

  return (
    <Screen>
      <View className="p-4 gap-4">
        <Text className="text-2xl font-bold">Billing</Text>
        <Card className="p-3">
          <Text className="text-xs text-gray-500 mb-2">Referral code (optional)</Text>
          <Input placeholder="Enter code" value={referral} onChangeText={setReferral} />
          <Text className="text-[10px] text-gray-400 mt-2">First 100 redemptions on partner codes may unlock benefits.</Text>
        </Card>
        {error ? <ErrorView message={error} /> : null}
        {plans.map((p) => (
          <Card key={p.plan} className="p-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold capitalize">{p.plan}</Text>
                <Text className="text-gray-600">
                  {(p.price_cents/100).toLocaleString(undefined, { style: 'currency', currency: p.currency || 'NGN' })}
                </Text>
              </View>
              <Button title="Subscribe" onPress={() => subscribe(p.plan)} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

