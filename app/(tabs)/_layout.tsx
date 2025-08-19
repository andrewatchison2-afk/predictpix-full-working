// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";

const BG = "#000000";
const GOLD = "#ffd700";

export default function TabsLayout() {
  return (
    <Tabs
      // NOTE: some Expo Router versions don't type `sceneContainerStyle` on Tabs,
      // so we only use screenOptions below.
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: false,

        // Labels only: hide the icon slot without collapsing the bar
        // (works cross-platform and avoids the “X in a box” placeholder)
        tabBarIconStyle: { width: 0, height: 0 },

        tabBarShowLabel: true,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: "#aaa",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: "#222",
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="suggest" options={{ title: "Suggest" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="more" options={{ title: "Menu" }} />
    </Tabs>
  );
}
