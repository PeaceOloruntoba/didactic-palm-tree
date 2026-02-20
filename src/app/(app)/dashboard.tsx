import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plan, setPlan] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

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
        setError("Failed to sync architecture");
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  if (loading) return <Loading label="Syncing Kitchen Architecture..." />;

  const currentLabel =
    period === "today"
      ? "Today"
      : period === "month"
        ? "This Month"
        : "This Week";

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="bg-white"
      >
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-end justify-between mb-8">
            <View className="flex-1">
              <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase leading-none">
                Kitchen Metrics
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-4" />
            </View>
            <Pressable
              onPress={() => setShowPeriodPicker(true)}
              className="flex-row items-center px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <Text className="text-[10px] font-black text-primary uppercase tracking-widest mr-2">
                {currentLabel}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#1f444c" />
            </Pressable>
          </View>

          {error && <ErrorView message={error} />}

          {/* Performance Dashboard */}
          <View className="mb-10">
            <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
              Performance Summary
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                label="Calories"
                value={summary?.totals?.calories ?? 0}
                unit="kcal"
              />
              <StatCard
                label="Protein"
                value={summary?.totals?.protein_grams ?? 0}
                unit="g"
              />
              <StatCard
                label="Carbs"
                value={summary?.totals?.carbs_grams ?? 0}
                unit="g"
              />
              <StatCard
                label="Fat"
                value={summary?.totals?.fat_grams ?? 0}
                unit="g"
              />
            </View>
          </View>

          {/* Weekly Architecture */}
          <View>
            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400">
                Weekly Architecture
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            </View>

            {plan ? (
              <View className="gap-6">
                {(
                  [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ] as const
                ).map((d) => (
                  <DayCard key={d} day={d} meals={plan?.[d] || {}} />
                ))}
              </View>
            ) : (
              <Card className="p-10 items-center justify-center bg-slate-50 border-dashed border-2 border-slate-200">
                <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No Plan Drafted
                </Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Period Picker Bottom Sheet */}
      <Modal
        transparent
        visible={showPeriodPicker}
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowPeriodPicker(false)}
          />
          <View style={styles.bottomSheet}>
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </View>
            <Text className="text-xl font-black text-primary italic uppercase tracking-tighter mb-6 text-center">
              Select Timeline
            </Text>
            {(["today", "week", "month"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setPeriod(p);
                  setShowPeriodPicker(false);
                }}
                className={`p-5 mb-3 rounded-2xl flex-row items-center justify-between ${
                  period === p
                    ? "bg-slate-50 border border-[#e9be6f]"
                    : "bg-white border border-slate-100"
                }`}
              >
                <Text
                  className={`font-bold text-lg capitalize ${period === p ? "text-primary" : "text-slate-500"}`}
                >
                  {p === "today"
                    ? "Today"
                    : p === "week"
                      ? "This Week"
                      : "This Month"}
                </Text>
                {period === p && (
                  <Ionicons name="checkmark-circle" size={24} color="#e9be6f" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <View className="w-[48%] bg-slate-50 rounded-3xl p-5 border border-slate-100">
      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
        {label}
      </Text>
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-black text-primary italic uppercase">
          {value}
        </Text>
        <Text className="text-[10px] font-bold text-[#e9be6f] ml-1 uppercase">
          {unit}
        </Text>
      </View>
    </View>
  );
}

function DayCard({ day, meals }: { day: string; meals: any }) {
  return (
    <View className="mb-2">
      <View className="flex-row items-center mb-3 ml-1">
        <Text className="text-lg font-black text-primary italic uppercase tracking-tighter">
          {day}
        </Text>
        <View className="h-[1px] flex-1 bg-slate-100 ml-3" />
      </View>
      <Card className="p-2 bg-white border-slate-100 rounded-[32px] shadow-sm shadow-slate-200">
        <MealSlot
          type="Breakfast"
          icon="sunny-outline"
          meal={meals?.breakfast}
        />
        <View className="h-[1px] bg-slate-50 mx-4" />
        <MealSlot type="Lunch" icon="fast-food-outline" meal={meals?.lunch} />
        <View className="h-[1px] bg-slate-50 mx-4" />
        <MealSlot type="Dinner" icon="moon-outline" meal={meals?.dinner} />
      </Card>
    </View>
  );
}

function MealSlot({
  type,
  icon,
  meal,
}: {
  type: string;
  icon: any;
  meal?: any;
}) {
  // Logic for tags
  const isHighProtein = meal?.protein_grams > 30;
  const isLowCarb = meal?.carbs_grams < 20 && meal?.carbs_grams !== undefined;

  return (
    <View className="flex-row items-center p-4">
      <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center border border-slate-100">
        <Ionicons name={icon} size={18} color="#1f444c" />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {type}
          </Text>
          <View className="flex-row gap-1">
            {isHighProtein && (
              <View className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <Text className="text-[8px] font-black text-emerald-600 uppercase">
                  High Protein
                </Text>
              </View>
            )}
            {isLowCarb && (
              <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <Text className="text-[8px] font-black text-blue-600 uppercase">
                  Low Carb
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text
          numberOfLines={1}
          className="text-[15px] font-bold text-primary italic leading-5"
        >
          {meal?.name || "No meal scheduled"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: 60,
    width: "100%",
  },
});
