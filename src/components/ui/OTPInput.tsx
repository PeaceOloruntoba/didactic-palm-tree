import React, { useRef } from "react";
import {
  TextInput,
  View,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

type Props = {
  value: string;
  onChange: (v: string) => void;
  digits?: number;
};

export function OTPInput({ value, onChange, digits = 6 }: Props) {
  const refs = useRef<TextInput[]>([]);
  const chars = Array.from({ length: digits }, (_, i) => value[i] || "");

  const handleChange = (t: string, i: number) => {
    const newVal = value.split("");
    newVal[i] = t.slice(-1);
    const combined = newVal.join("");
    onChange(combined);

    if (t && i < digits - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    i: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between w-full">
      {chars.map((c, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            if (r) refs.current[i] = r;
          }}
          value={c}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          className={`w-[14%] h-16 rounded-2xl bg-slate-50 border text-center text-2xl font-black text-primary ${
            c ? "border-[#e9be6f]" : "border-slate-100"
          }`}
          selectionColor="#e9be6f"
        />
      ))}
    </View>
  );
}
