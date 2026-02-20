import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function MoreLayout() {
  return (
    <>
      <StatusBar style="light" />
      
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { 
            backgroundColor: "#1f444c", 
          },
          // Fixed: Removed textTransform, fontStyle, and letterSpacing 
          // as they often trigger TS errors in headerTitleStyle
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 16,
            color: "#e9be6f", 
          },
          headerTintColor: "#e9be6f", 
          // Fixed: headerBackTitleVisible is usually an iOS-only property 
          // that can be picky in certain Stack versions
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "ACCOUNT", // Manual uppercase to replace textTransform
          }}
        />

        <Stack.Screen
          name="billing"
          options={{
            headerTitle: "SUBSCRIPTION",
          }}
        />
        
        <Stack.Screen
          name="edit-profile"
          options={{
            headerTitle: "EDIT PROFILE",
          }}
        />
        
        <Stack.Screen
          name="affiliate"
          options={{
            headerTitle: "AFFILIATE PROGRAM",
          }}
        />
      </Stack>
    </>
  );
}