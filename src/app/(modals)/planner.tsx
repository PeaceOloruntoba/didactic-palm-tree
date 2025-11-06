import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { api } from "../../lib/api";
import { SearchableSelect, Option } from "../../components/ui/SearchableSelect";
import { Card } from "../../components/ui/Card";
import { router } from "expo-router";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;
const SLOTS = ["breakfast","lunch","dinner"] as const;

type Plan = Record<string, Record<string, { id?: number; name?: string } | null>>;

export default function Planner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [plan, setPlan] = useState<Plan>({});
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, recs] = await Promise.all([
          api.mealPlan.get().catch(() => ({})),
          api.recipes().catch(() => []),
        ]);
        setOptions((recs || []).map((r: any) => ({ id: r.id, name: r.name })));
        const normalized: Plan = {};
        DAYS.forEach((d) => {
          normalized[d] = normalized[d] || ({} as any);
          SLOTS.forEach((s) => {
            normalized[d][s] = p?.[d]?.[s] ?? null;
          });
        });
        setPlan(normalized);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      await api.mealPlan.set(plan);
      Alert.alert("Saved", "Meal plan updated");
      // Close modal -> return to Dashboard
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save plan");
    }
  };

  if (loading) return <Loading label="Loading planner" />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {error ? <ErrorView message={error} /> : null}
        {DAYS.map((day) => (
          <Card key={day} className="mb-4 p-3">
            <Text className="font-semibold text-lg mb-2">{day}</Text>
            {SLOTS.map((slot) => (
              <View key={slot} className="mb-3">
                <View className="flex-row items-center mb-1">
                  <View className="px-2 py-0.5 rounded-full bg-emerald-100 mr-2">
                    <Text className="text-emerald-700 text-xs font-medium capitalize">{slot}</Text>
                  </View>
                  <Text className="text-gray-500 text-xs">Pick a recipe</Text>
                </View>
                <SearchableSelect
                  options={options}
                  value={plan[day]?.[slot] ? { id: plan[day]![slot]!.id!, name: plan[day]![slot]!.name || "" } : null}
                  placeholder={`Pick a recipe for ${slot}`}
                  onChange={(opt) =>
                    setPlan((prev) => ({
                      ...prev,
                      [day]: {
                        ...(prev[day] || {}),
                        [slot]: opt ? { id: Number(opt.id), name: opt.name } : null,
                      },
                    }))
                  }
                />
              </View>
            ))}
          </Card>
        ))}
        <Button title="Save plan" onPress={save} />
      </ScrollView>
    </Screen>
  );
}
