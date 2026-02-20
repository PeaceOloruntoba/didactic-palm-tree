import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View, Modal, Pressable, Switch, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { api } from "../../lib/api";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: any; created_at: string };

export default function AI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [stream, setStream] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [planBudget, setPlanBudget] = useState<string>("");
  const [planMinutes, setPlanMinutes] = useState<string>("");
  
  const inputRef = useRef<TextInput | null>(null);
  const listRef = useRef<FlatList<Msg> | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(undefined);
      try {
        const sid = await api.ai.ensureSession();
        setSessionId(sid);
        const msgs = await api.ai.messages(sid);
        setMessages(Array.isArray(msgs) ? msgs.map(m => ({ ...m, role: m.role as any })) : []);
      } catch (e: any) {
        setError("Failed to initialize Bunzi AI");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      setInput("");
      const userMsg: Msg = { id: String(Date.now()), role: "user", content: { text }, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      
      const res = await api.ai.chat(text, stream);
      if (sessionId) {
        try {
          const latest = await api.ai.messages(sessionId);
          const normalized = Array.isArray(latest) ? latest.map(m => ({ ...m, role: m.role as "user" | "assistant" | "system" })) : [];
          setMessages(normalized);
        } catch {
          const replyText = res?.message?.text || "I've processed that for you.";
          const aiMsg: Msg = { id: String(Date.now() + 1), role: "assistant", content: { text: replyText }, created_at: new Date().toISOString() };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } else {
        const replyText = res?.message?.text || "I've processed that for you.";
        const aiMsg: Msg = { id: String(Date.now() + 1), role: "assistant", content: { text: replyText }, created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e: any) {
      Alert.alert("AI Error", "I couldn't reach the kitchen brain. Check your subscription.");
    } finally {
      setSending(false);
    }
  };

  const generatePlan = async () => {
    setSending(true);
    try {
      const prompt = input.trim() || undefined;
      await api.ai.plan({ 
        prompt, 
        budget: planBudget ? Number(planBudget) : undefined, 
        max_prep_minutes: planMinutes ? Number(planMinutes) : undefined 
      } as any);
      
      Alert.alert("Architectural Success", "Your 7-day meal plan is ready in your Dashboard.");
      setShowPlanModal(false);
      setPlanBudget("");
      setPlanMinutes("");
    } catch (e: any) {
      Alert.alert("Error", "Could not generate plan.");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    const body = item?.content?.text || (typeof item.content === "string" ? item.content : "Thinking...");

    return (
      <View className={`px-4 py-3 ${isUser ? "items-end" : "items-start"}`}>
        <View 
          className={`max-w-[82%] px-5 py-4 rounded-[24px] ${
            isUser ? "bg-slate-100 rounded-tr-none" : "bg-primary rounded-tl-none shadow-md shadow-primary/20"
          }`}
        >
          <Text className={`text-[15px] leading-6 font-semibold ${isUser ? "text-primary" : "text-white"}`}>
            {body}
          </Text>
          <Text className={`text-[9px] mt-2 font-black uppercase tracking-widest ${isUser ? "text-slate-400" : "text-[#e9be6f]"}`}>
            {isUser ? "You" : "Bunzi AI"}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) return <Loading label="Consulting the chef..." />;

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1 }} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Chat List */}
        <View className="flex-1 bg-white">
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 20 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
                <View className="items-center mb-4 px-10">
                    <View className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-end Encrypted Chef</Text>
                    </View>
                </View>
            }
          />
        </View>

        {/* Input Dock */}
        <View className="p-4 bg-white border-t border-slate-50">
          <View className="flex-row items-center gap-3">
            <Pressable 
                onPress={() => setShowPlanModal(true)}
                className="h-12 w-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100"
            >
                <Ionicons name="calendar-outline" size={24} color="#1f444c" />
            </Pressable>
            
            <View className="flex-1 relative justify-center">
                <TextInput
                    ref={inputRef as any}
                    placeholder="Message BunziMeal AI..."
                    value={input}
                    onChangeText={setInput}
                    multiline
                    className="bg-slate-50 max-h-12 rounded-2xl px-5 pr-12 py-4 text-primary font-bold border border-slate-100"
                />
                <Pressable 
                    onPress={send}
                    disabled={sending || !input.trim()}
                    className="absolute right-2 h-10 w-10 bg-primary rounded-xl items-center justify-center"
                >
                    {sending ? <ActivityIndicator size="small" color="#e9be6f" /> : <Ionicons name="arrow-up" size={20} color="#e9be6f" />}
                </Pressable>
            </View>
          </View>
        </View>

        {/* Plan Generation Modal */}
        <Modal transparent visible={showPlanModal} animationType="slide" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPlanModal(false)} />
            <View style={styles.bottomSheet}>
              <View className="items-center py-4">
                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </View>

              <Text className="text-2xl font-black text-primary italic uppercase tracking-tighter mb-2">Architect Plan</Text>
              <Text className="text-slate-400 text-xs font-medium mb-6">Specify your constraints for a 7-day meal cycle.</Text>
              
              <View className="gap-4">
                <Input 
                    placeholder="Instructions (e.g. Keto, No Peanuts)" 
                    value={input} 
                    onChangeText={setInput} 
                    className="h-16 bg-slate-50 rounded-2xl px-5 font-bold"
                />
                <View className="flex-row gap-3">
                    <Input 
                        placeholder="Budget" 
                        value={planBudget} 
                        onChangeText={setPlanBudget} 
                        keyboardType="numeric" 
                        className="flex-1 h-16 bg-slate-50 rounded-2xl px-5 font-bold"
                    />
                    <Input 
                        placeholder="Max Mins" 
                        value={planMinutes} 
                        onChangeText={setPlanMinutes} 
                        keyboardType="numeric" 
                        className="flex-1 h-16 bg-slate-50 rounded-2xl px-5 font-bold"
                    />
                </View>
                
                <Button 
                    title="Generate 7-Day Plan" 
                    onPress={generatePlan} 
                    loading={sending} 
                    className="h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20 mt-2"
                    textClassName="text-white font-bold uppercase tracking-widest"
                />
              </View>
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
    paddingBottom: 60,
    width: "100%",
  },
});
