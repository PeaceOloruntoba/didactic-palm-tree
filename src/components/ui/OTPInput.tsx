import React, { useRef } from "react";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (v: string) => void;
  digits?: number;
};

export function OTPInput({ value, onChange, digits = 6 }: Props) {
  const refs = useRef<TextInput[]>([]);
  const chars = Array.from({ length: digits }, (_, i) => value[i] || "");

  return (
    <View className="flex-row justify-center gap-2">
      {chars.map((c, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            if (r) refs.current[i] = r;
          }}
          value={c}
          onChangeText={(t) => {
            const next = (value.slice(0, i) + (t.slice(-1) || "")).slice(0, i + 1) + value.slice(i + 1);
            onChange(next.slice(0, digits));
            if (t && i < digits - 1) refs.current[i + 1]?.focus();
          }}
          keyboardType="number-pad"
          maxLength={1}
          className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg"
        />
      ))}
    </View>
  );
}
