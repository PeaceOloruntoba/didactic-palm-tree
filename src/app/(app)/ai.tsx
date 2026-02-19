import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";
import { ErrorView } from "../../components/ui/ErrorView";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: any; created_at: string };

export default function AI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(undefined);
      try {
        const sid = await api.ai.ensureSession();
        setSessionId(sid);
        const msgs = await api.ai.messages(sid);
        setMessages(Array.isArray(msgs) ? msgs.map(m => ({ ...m, role: m.role as "user" | "assistant" | "system" })) : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.response?.data?.errorMessage || "Failed to initialize AI");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    setError(undefined);
    try {
      setInput("");
      setMessages((prev) => [...prev, { id: String(Date.now()), role: "user", content: { text }, created_at: new Date().toISOString() }]);
      const res = await api.ai.chat(text, false);
      const replyText = res?.message?.text || "Done.";
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: "assistant", content: { text: replyText }, created_at: new Date().toISOString() }]);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.errorMessage || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const generatePlan = async () => {
    setSending(true);
    setError(undefined);
    try {
      const res = await api.ai.plan({ prompt: input.trim() || undefined });
      setInput("");
      Alert.alert("Meal Plan", "Meal plan generated. Check your Dashboard and Planner.");
      setMessages((prev) => [...prev, { id: String(Date.now() + 2), role: "assistant", content: { text: "Meal plan generated successfully. Check your dashboard to view the plan." }, created_at: new Date().toISOString() }]);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.errorMessage || "Failed to generate meal plan");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    const bubbleColor = isUser ? "bg-tertiary" : item.role === "assistant" ? "bg-primary" : "bg-gray-200";
    const textColor = isUser ? "text-white" : item.role === "assistant" ? "text-secondary" : "text-gray-700";
    const body = item?.content?.text || (typeof item.content === "string" ? item.content : JSON.stringify(item.content));
    return (
      <View className={`px-4 py-2 ${isUser ? "items-end" : "items-start"}`}>
        <View className={`max-w-[85%] rounded-xl px-3 py-2 ${bubbleColor}`}>
          <Text className={`text-base ${textColor}`}>{body}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <Loading label="Loading AI" />;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <View className="flex-1">
          <View className="p-4">
            <Text className="text-2xl font-bold text-primary">BunziMeal AI</Text>
            {error ? <ErrorView message={error} /> : null}
          </View>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </View>
        <Card className="p-3">
          <View className="gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask BunziMeal AI..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
            />
            <View className="flex-row gap-2">
              <Button title="Send" onPress={send} loading={sending} />
              <Button title="Generate Plan" onPress={generatePlan} className="bg-primaryDark" loading={sending} />
            </View>
            <Text className="text-[10px] text-gray-400">
              AI features require an active subscription. You may be redirected to Billing if needed.
            </Text>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
