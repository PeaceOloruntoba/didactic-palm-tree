import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

export const Input = forwardRef<TextInput, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
      className={`h-12 rounded-md border border-gray-300 px-3 text-base ${props.className || ""}`}
      placeholderTextColor="#9ca3af"
    />
  );
});
