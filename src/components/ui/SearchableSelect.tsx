import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Input } from "./Input";

export type Option = { id: number | string; name: string };

type Props = {
  options: Option[];
  value: Option | null | undefined;
  onChange: (opt: Option | null) => void;
  placeholder?: string;
};

export function SearchableSelect({ options, value, onChange, placeholder }: Props) {
  const [q, setQ] = useState(value?.name || "");
  const [debounced, setDebounced] = useState(q);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    if (!term) return options.slice(0, 20);
    return options.filter((o) => o.name.toLowerCase().includes(term)).slice(0, 20);
  }, [debounced, options]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  // Keep input text in sync when caller updates value
  useEffect(() => {
    setQ(value?.name || "");
  }, [value?.name]);

  return (
    <View>
      <Input
        placeholder={placeholder}
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChangeText={(t) => {
          setQ(t);
          if (!t) onChange(null);
        }}
      />
      {open && (
        <View className="mt-1 rounded-md border border-gray-200 bg-white max-h-64 shadow-sm">
          <ScrollView keyboardShouldPersistTaps="always">
            {filtered.map((item) => (
              <Pressable
                key={String(item.id)}
                className="px-3 py-2 active:bg-gray-100"
                onPress={() => {
                  onChange(item);
                  setQ(item.name);
                  setOpen(false);
                }}
              >
                <Text className="text-gray-900">{`#${item.id} - ${item.name}`}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
