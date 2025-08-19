// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs group */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Non-tab routes */}
      <Stack.Screen name="login" options={{ presentation: "modal" }} />
      <Stack.Screen name="signup" options={{ presentation: "modal" }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="confirm-market" />

      {/* IMPORTANT: target the folder 'market' (its [id] lives under its own layout) */}
      <Stack.Screen name="market" />

      <Stack.Screen name="admin/resolve" />
    </Stack>
  );
}
