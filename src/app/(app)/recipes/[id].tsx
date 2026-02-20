import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Screen } from "../../../components/layout/Screen";
import { Loading } from "../../../components/ui/Loading";
import { api } from "../../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

export default function RecipeDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await api.recipe(String(id));
        setRecipe(r || null);
        setNutrition(r?.full_nutrition || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loading label="Decoding Recipe Architecture..." />;

  return (
    <Screen>
      <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
        {/* Visual Header */}
        <View className="h-[350px] w-full bg-slate-100 relative">
          {recipe?.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              className="w-full h-full"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="restaurant" size={80} color="#cbd5e1" />
            </View>
          )}
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </View>

        <View className="px-6 -mt-10">
          <View className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200">
            {recipe?.category && (
              <View className="bg-[#e9be6f] self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                  {recipe.category}
                </Text>
              </View>
            )}
            <Text className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-8">
              {recipe?.name}
            </Text>

            <View className="flex-row items-center mt-6 gap-6">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={18} color="#94a3b8" />
                <Text className="text-primary font-bold ml-2">25 MIN</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="flame-outline" size={18} color="#94a3b8" />
                <Text className="text-primary font-bold ml-2">
                  {(nutrition?.calories as number) ?? 450} KCAL
                </Text>
              </View>
            </View>
          </View>

          {/* Macro Profile */}
          <View className="mt-8">
            <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-6 ml-1">
              Nutrient Analysis
            </Text>
            <View className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
              <MacroBar
                label="Protein"
                value={(nutrition?.protein_grams as number) ?? 0}
                color="#1f444c"
              />
              <MacroBar
                label="Carbs"
                value={(nutrition?.carbs_grams as number) ?? 0}
                color="#e9be6f"
              />
              <MacroBar
                label="Fats"
                value={(nutrition?.fat_grams as number) ?? 0}
                color="#fb923c"
              />
            </View>
          </View>

          {/* Cooking Process */}
          <View className="mt-8 mb-20">
            <Text className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
              Instructions
            </Text>
            <View className="bg-white border border-slate-100 p-6 rounded-[32px]">
              <Text className="text-slate-600 leading-6 font-medium">
                {recipe?.details?.replace(/<[^>]*>?/gm, "") ||
                  "No detailed instructions provided."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function MacroBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const percentage = Math.min((value / 100) * 100, 100); // Simple visual scaling
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          {label}
        </Text>
        <Text className="text-primary font-bold">{value || 0}g</Text>
      </View>
      <View className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <View
          style={{ width: `${percentage}%`, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
