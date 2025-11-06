import React, { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...rest }: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <View
      {...rest}
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </View>
  );
}
