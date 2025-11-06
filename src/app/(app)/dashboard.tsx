import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plan, setPlan] = useState<any>(null);
  const [summary, setSummary] = useState<{
    period: string;
    range: { from: string; to: string };
    totals: { calories: number; protein_grams: number; carbs_grams: number; fat_grams: number };
  } | null>(null);
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          api.mealPlan.get().catch(() => null),
          api.stats.summary(period).catch(() => null),
        ]);
        setPlan(p);
        setSummary(s);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  if (loading) return <Loading label="Preparing your dashboard" />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {error ? <ErrorView message={error} /> : null}

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold">
            {period === "today" ? "Today" : period === "month" ? "This month" : "This week"}
          </Text>
          <View className="flex-row gap-2">
            <Chip label="Today" active={period === "today"} onPress={() => setPeriod("today")} />
            <Chip label="Week" active={period === "week"} onPress={() => setPeriod("week")} />
            <Chip label="Month" active={period === "month"} onPress={() => setPeriod("month")} />
          </View>
        </View>
        <View className="flex-row gap-3 mb-6">
          <StatCard label="Calories" value={`${summary?.totals?.calories ?? 0}`} />
          <StatCard label="Protein" value={`${summary?.totals?.protein_grams ?? 0}g`} />
          <StatCard label="Carbs" value={`${summary?.totals?.carbs_grams ?? 0}g`} />
          <StatCard label="Fat" value={`${summary?.totals?.fat_grams ?? 0}g`} />
        </View>

        <Text className="text-xl font-semibold mb-3">Weekly plan</Text>
        {plan ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            <Card className="p-3">
              <View className="flex-row">
                <HeaderCell label="Day" />
                <HeaderCell label="Breakfast" />
                <HeaderCell label="Lunch" />
                <HeaderCell label="Dinner" />
              </View>
              {(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const).map((d) => (
                <View key={d} className="flex-row">
                  <DayCell>{d}</DayCell>
                  <MealCell color="bg-emerald-50" text="text-emerald-700">{plan?.[d]?.breakfast?.name || "-"}</MealCell>
                  <MealCell color="bg-indigo-50" text="text-indigo-700">{plan?.[d]?.lunch?.name || "-"}</MealCell>
                  <MealCell color="bg-amber-50" text="text-amber-700">{plan?.[d]?.dinner?.name || "-"}</MealCell>
                </View>
              ))}
            </Card>
          </ScrollView>
        ) : (
          <Text className="text-gray-500">No plan yet</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-lg border border-gray-200 p-3 bg-white">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-lg font-semibold">{value}</Text>
    </View>
  );
}

function computeRange(period: "today" | "week" | "month"): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (period === "today") {
    return { from: to, to };
  }
  if (period === "month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = first.toISOString().slice(0, 10);
    return { from, to };
  }
  // week: last 7 days
  const fromDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Text
      onPress={onPress}
      className={`px-3 py-1 rounded-full text-sm border ${
        active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"
      }`}
    >
      {label}
    </Text>
  );
}

function HeaderCell({ label }: { label: string }) {
  return (
    <View className="w-56 px-3 py-2 border-b border-gray-200">
      <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{label}</Text>
    </View>
  );
}

function DayCell({ children }: { children: React.ReactNode }) {
  return (
    <View className="w-56 px-3 py-3 border-b border-gray-100 bg-gray-50">
      <Text className="text-gray-800 font-medium">{children}</Text>
    </View>
  );
}

function MealCell({ children, color, text }: { children: React.ReactNode; color: string; text: string }) {
  return (
    <View className={`w-56 px-3 py-3 border-b border-gray-100 rounded-sm ${color}`}>
      <Text numberOfLines={2} className={`${text} font-medium`}>{children}</Text>
    </View>
  );
}
