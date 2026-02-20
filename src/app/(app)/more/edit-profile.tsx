import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Screen } from "../../../components/layout/Screen";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../lib/api";
import { useAuth } from "../../../store/auth";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
  const { countries, fetchCountries } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryId, setCountryId] = useState<number | null>(null);
  const [openCountryList, setOpenCountryList] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const { user } = await api.profile.get();
      setFirstName(user?.first_name || "");
      setLastName(user?.last_name || "");
      setCountryId(user?.country_id ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    // Preload countries immediately to ensure the modal list is ready
    fetchCountries().catch(() => {});
    load();
  }, []);

  const saveNames = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.profile.update({ first_name: firstName, last_name: lastName });
      Alert.alert("Success", "Your name has been updated.");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const saveCountry = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.profile.updateCountry(countryId ?? null);
      Alert.alert("Success", "Your location has been updated.");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update country");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-8">
            {/* Header Section */}
            <View className="mb-8">
              <Text className="text-4xl font-black text-primary tracking-tighter italic uppercase">
                Profile
              </Text>
              <View className="h-1.5 w-12 bg-[#e9be6f] mt-3 mb-2" />
              <Text className="text-slate-500 font-medium leading-5">
                Maintain your kitchen identity and settings.
              </Text>
            </View>

            {error && (
              <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center mb-6">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-600 text-sm font-bold ml-2 flex-1">
                  {error}
                </Text>
              </View>
            )}

            {/* Personal Details Section */}
            <View className="mb-10">
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
                Personal Details
              </Text>
              <View className="gap-4">
                <View>
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100"
                  />
                </View>
                <View>
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    className="h-16 rounded-2xl bg-slate-50 px-5 text-primary font-semibold border border-slate-100"
                  />
                </View>
                <Button
                  title="Update Names"
                  onPress={saveNames}
                  loading={loading}
                  className="h-14 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                  textClassName="text-white font-bold uppercase tracking-widest text-xs"
                />
              </View>
            </View>

            {/* Location Section */}
            <View>
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 mb-4 ml-1">
                Regional Settings
              </Text>
              <View className="gap-4">
                <Pressable
                  className="h-16 rounded-2xl bg-slate-50 px-5 border border-slate-100 flex-row items-center justify-between"
                  onPress={() => setOpenCountryList(true)}
                >
                  <View>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase">
                      Current Country
                    </Text>
                    <Text className="text-primary font-bold text-base">
                      {countryId
                        ? countries.find((c) => c.id === countryId)?.name
                        : "Select Country"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#1f444c" />
                </Pressable>

                <Button
                  title="Update Location"
                  onPress={saveCountry}
                  loading={loading}
                  className="h-14 bg-white border-2 border-primary rounded-2xl"
                  textClassName="text-primary font-bold uppercase tracking-widest text-xs"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={openCountryList}
          animationType="slide"
          transparent={true}
          statusBarTranslucent
          onRequestClose={() => setOpenCountryList(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setOpenCountryList(false)}
            />

            <View style={styles.bottomSheet}>
              {/* Handle Bar */}
              <View className="items-center py-4">
                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </View>

              <Text className="text-xl font-black text-primary uppercase italic tracking-tighter mb-6 text-center">
                Select Country
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                {countries.length === 0 ? (
                  <View className="py-20 items-center">
                    <ActivityIndicator color="#e9be6f" size="large" />
                    <Text className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-[10px]">
                      Fetching Regions
                    </Text>
                  </View>
                ) : (
                  countries.map((c) => (
                    <Pressable
                      key={c.id}
                      className={`flex-row items-center justify-between p-5 mb-3 rounded-2xl ${
                        countryId === c.id
                          ? "bg-slate-50 border border-[#e9be6f]"
                          : "bg-white border border-slate-100"
                      }`}
                      onPress={() => {
                        setCountryId(c.id);
                        setOpenCountryList(false);
                      }}
                    >
                      <View>
                        <Text className="text-primary font-bold text-lg">
                          {c.name}
                        </Text>
                        <Text className="text-slate-400 font-medium tracking-tight">
                          {c.currency} • {c.code}
                        </Text>
                      </View>
                      {countryId === c.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#e9be6f"
                        />
                      )}
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
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
    maxHeight: "80%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
});
