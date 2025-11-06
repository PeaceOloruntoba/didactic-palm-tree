import React from "react";
import { TextInput, TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      className={`h-12 rounded-md border border-gray-300 px-3 text-base ${
        props.className || ""
      }`}
      placeholderTextColor="#9ca3af"
    />
  );
}
