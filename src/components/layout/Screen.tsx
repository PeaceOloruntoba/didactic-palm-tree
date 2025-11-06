import React, { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

export function Screen({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View {...rest} style={style} className={`flex-1 bg-white ${rest.className || ""}`}>
      {children}
    </View>
  );
}
