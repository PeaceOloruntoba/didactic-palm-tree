import React, { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...rest }: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <View
      {...rest}
      className={`rounded-2xl bg-white shadow-lg shadow-primary ${className}`}
    >
      {children}
    </View>
  );
}
