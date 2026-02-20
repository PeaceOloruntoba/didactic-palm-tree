import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  DeviceEventEmitter,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { api } from "../../lib/api";
import { SearchableSelect, Option } from "../../components/ui/SearchableSelect";
import { Card } from "../../components/ui/Card";
import { router } from "expo-router";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const SLOTS = ["breakfast", "lunch", "dinner"] as const;

type Plan = Record<string, Record<string, Option | null>>;

export default function Planner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plan, setPlan] = useState<Plan>({});
  const [options, setOptions] = useState<Option[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const clearAll = useCallback(() => {
    setPlan((prev) => {
      const next: Plan = {};
      DAYS.forEach((d) => {
        next[d] = {};
        SLOTS.forEach((s) => {
          next[d][s] = null;
        });
      });
      return next;
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [p, recs] = await Promise.all([
          api.mealPlan.get().catch(() => ({})),
          api.recipes().catch(() => []),
        ]);

        const formattedOptions: Option[] = (recs || []).map((r: any) => ({
          id: String(r.id),
          name: String(r.name),
        }));
        setOptions(formattedOptions);
        const normalized: Plan = {};
        DAYS.forEach((d) => {
          normalized[d] = {};
          SLOTS.forEach((s) => {
            normalized[d][s] = p?.[d]?.[s] ?? null;
          });
        });
        setPlan(normalized);
      } catch (e: any) {
        setError("Failed to initialize architecture");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("planner_clear_all", () => {
      Alert.alert("Clear All", "Reset all meals for the week?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearAll() },
      ]);
    });
    return () => sub.remove();
  }, [clearAll]);

  const handleOptionChange = useCallback(
    (day: string, slot: string, opt: Option | null) => {
      setPlan((prev) => ({
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [slot]: opt ? { id: Number(opt.id), name: opt.name } : null,
        },
      }));
    },
    [],
  );

  const save = async () => {
    try {
      await api.mealPlan.set(plan);
      Alert.alert(
        "Architecture Saved",
        "Your weekly meal cycle has been updated.",
      );
      router.back();
    } catch (e: any) {
      Alert.alert("Error", "Failed to sync changes.");
    }
  };

  if (loading) return <Loading label="Loading architecture..." />;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 24,
            paddingBottom: 100,
          }}
          keyboardShouldPersistTaps="handled"
          className="bg-white"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {error && <ErrorView message={error} />}

          <View className="mb-8">
            <Text className="text-3xl font-black text-primary italic uppercase tracking-tighter">
              Blueprint
            </Text>
            <View className="h-1.5 w-12 bg-[#e9be6f] mt-2 mb-4" />
            <Text className="text-slate-500 font-medium">
              Map out your nutrition for the next 7 days. Changes reflect
              instantly on your dashboard.
            </Text>
          </View>

          {DAYS.map((day) => (
            <Card
              key={day}
              className="mb-6 p-5 rounded-[32px] bg-slate-50 border-slate-100 shadow-none"
            >
              <View className="flex-row items-center mb-5">
                <View className="h-8 w-8 bg-primary rounded-lg items-center justify-center mr-3">
                  <Ionicons name="calendar-clear" size={16} color="#e9be6f" />
                </View>
                <Text className="font-black text-primary text-xl uppercase italic tracking-tighter">
                  {day}
                </Text>
              </View>

              {SLOTS.map((slot, index) => {
                const currentOpenKey = `${day}:${slot}`;
                return (
                  <View
                    key={currentOpenKey}
                    className={`${index !== SLOTS.length - 1 ? "mb-6" : ""}`}
                  >
                    <View className="flex-row items-center justify-between mb-2 px-1">
                      <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#e9be6f] mr-2" />
                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {slot}
                        </Text>
                      </View>
                    </View>

                    <SearchableSelect
                      options={options}
                      value={plan[day]?.[slot]}
                      placeholder={`Select ${slot} recipe...`}
                      open={openKey === currentOpenKey}
                      onOpenChange={(o) =>
                        setOpenKey(o ? currentOpenKey : null)
                      }
                      onChange={(opt) => handleOptionChange(day, slot, opt)}
                    />
                  </View>
                );
              })}
            </Card>
          ))}

          <View className="mt-4">
            <Button
              title="Save Architecture"
              onPress={save}
              className="h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20"
              textClassName="text-white font-bold uppercase tracking-widest"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
