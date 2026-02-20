import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  textClassName?: string;
};

export function Button({ title, onPress, className = "", disabled, loading, textClassName = "" }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`h-12 rounded-md bg-primary items-center justify-center ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#e9be6f" />
      ) : (
        <Text className={`text-secondary font-medium ${textClassName}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
