import React, { useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../store/auth";

export default function Signup() {
  const { register, loading, error, clearError, countries, fetchGoalKeys, setGoals, fetchCountries } = useAuth();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [goalKeys, setGoalKeys] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [openCountryList, setOpenCountryList] = useState(false);

  const params = useLocalSearchParams<{ referralId?: string; ref?: string }>();

  useEffect(() => {
    const ref = (params.referralId as string) || (params.ref as string) || "";
    if (ref) setReferral(ref);
  }, [params.referralId, params.ref]);

  useEffect(() => {
    fetchCountries().catch(() => {});
    fetchGoalKeys().then(setGoalKeys).catch(() => {});
  }, []);

  const handleSignup = async () => {
    clearError();
    const payload = {
      email,
      password,
      first_name,
      last_name,
      country_id: Number(countryId || 0),
      referral_code: referral.trim() || undefined,
    };
    const res = await register(payload as any);
    if (res) router.push({ pathname: "/(auth)/verify-otp", params: { email } });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 mt-12 py-10 bg-white">
            {/* Header Section */}
            <View className="mb-8">
              <Text className="text-5xl font-black text-primary tracking-tighter italic uppercase leading-none">
                Start Fresh
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-4 mb-2" />
              <Text className="text-slate-500 text-lg font-medium leading-6">
                Create your BunziMeal account and personalize your journey.
              </Text>
            </View>

            {/* Form Card */}
            <Card className="p-0 bg-transparent border-0 shadow-none gap-4">
              {error && (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                  <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              )}

              {step === 1 ? (
                <View className="gap-3">
                  {/* First Name */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      First Name
                    </Text>
                    <Input
                      placeholder="Kunle"
                      value={first_name}
                      onChangeText={setFirstName}
                      className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                    />
                  </View>
                  {/* Last Name */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      Last Name
                    </Text>
                    <Input
                      placeholder="Afolayan"
                      value={last_name}
                      onChangeText={setLastName}
                      className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                    />
                  </View>
                  {/* Email Address */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      Email Address
                    </Text>
                    <Input
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                    />
                  </View>
                  {/* Security (Password) */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      Security
                    </Text>
                    <View className="relative justify-center">
                      <Input
                        placeholder="Create a strong password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        className="h-16 rounded-2xl bg-slate-50 px-5 pr-16 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                      />
                      <Pressable
                        className="absolute right-0 h-16 w-14 items-center justify-center"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#94a3b8"
                        />
                      </Pressable>
                    </View>
                  </View>
                  {/* Referral Code */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      Referral Code (Optional)
                    </Text>
                    <Input
                      placeholder="ABC1234"
                      autoCapitalize="characters"
                      value={referral}
                      onChangeText={setReferral}
                      className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 focus:border-[#e9be6f]"
                    />
                  </View>
                  <View className="mt-2">
                    <Button
                      title="Next"
                      loading={false}
                      onPress={() => setStep(2)}
                      className="h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                      textClassName="text-white font-bold text-lg uppercase tracking-widest"
                    />
                  </View>
                </View>
              ) : (
                <View className="gap-3">
                  {/* Country */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 ml-1">
                      Location
                    </Text>
                    <Pressable
                      className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100 justify-center"
                      onPress={() => {
                        Keyboard.dismiss();
                        setOpenCountryList(true);
                      }}
                    >
                      <Text className="text-primary font-semibold">
                        {countryId
                          ? countries.find((c) => c.id === countryId)?.name
                          : "Select Country"}
                      </Text>
                    </Pressable>
                    {openCountryList ? (
                      <View />
                    ) : null}
                  </View>
                  {/* Goals */}
                  <View>
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#e9be6f] mb-2 ml-1">
                      What are your goals?
                    </Text>
                    <View className="bg-slate-50 rounded-3xl p-4 border-2 border-dashed border-slate-200">
                      <View className="flex-row flex-wrap">
                        {goalKeys.map((k) => {
                          const active = selectedGoals.includes(k);
                          return (
                            <Pressable
                              key={k}
                              className={`px-4 py-2 mr-2 mb-2 rounded-2xl ${active ? "bg-primary" : "bg-white border border-slate-200"} `}
                              onPress={() =>
                                setSelectedGoals((prev) =>
                                  prev.includes(k)
                                    ? prev.filter((g) => g !== k)
                                    : [...prev, k]
                                )
                              }
                            >
                              <Text className={`text-sm font-bold ${active ? "text-white" : "text-primary"}`}>
                                {k.replace(/_/g, " ")}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                  {/* Signup Action */}
                  <View className="mt-2">
                    <Button
                      title="Create Account"
                      loading={loading}
                      onPress={async () => {
                        await handleSignup();
                        if (selectedGoals.length) {
                          await setGoals(selectedGoals).catch(() => {});
                        }
                      }}
                      className="h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                      textClassName="text-white font-bold text-lg uppercase tracking-widest"
                    />
                  </View>
                  {/* Back to Step 1 */}
                  <View className="items-center">
                    <Pressable onPress={() => setStep(1)}>
                      <Text className="text-slate-400 font-bold underline">
                        Go back
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Signup Action */}
              {/* Step-specific CTAs handled above */}

              {/* Login Redirect */}
              <View className="flex-row justify-center items-center mt-2 px-1">
                <Text className="text-slate-400 font-semibold text-[15px]">
                  Already a member?{" "}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text className="text-[#e9be6f] font-bold text-[15px]">
                      Sign in
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </Card>
          </View>
        </ScrollView>
        <Modal
          visible={openCountryList}
          animationType="slide"
          transparent
          onRequestClose={() => setOpenCountryList(false)}
        >
          <Pressable
            className="flex-1 bg-black/30"
            onPress={() => setOpenCountryList(false)}
          >
            <View className="mt-auto bg-white rounded-t-3xl p-4 max-h-[70%]">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-primary">Select Country</Text>
                <Pressable onPress={() => setOpenCountryList(false)} className="p-2">
                  <Ionicons name="close" size={22} color="#64748b" />
                </Pressable>
              </View>
              <FlatList
                data={countries}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                windowSize={10}
                getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
                ListEmptyComponent={
                  <View className="p-4 items-center justify-center">
                    <ActivityIndicator size="small" color="#1f444c" />
                    <Text className="text-slate-400 mt-2">Loading countries...</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <Pressable
                    className="px-2 py-3 border-b border-slate-100"
                    onPress={() => {
                      setCountryId(item.id);
                      setOpenCountryList(false);
                    }}
                  >
                    <Text className="text-primary font-semibold">{item.name}</Text>
                    <Text className="text-slate-400 text-xs">{item.code} • {item.currency}</Text>
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
  );
}
