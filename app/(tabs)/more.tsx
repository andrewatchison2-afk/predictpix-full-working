// app/(tabs)/more.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Platform, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { apiGet } from "../../lib/api/client";

const BG = "#000";
const CARD = "#1c1c1e";
const GOLD = "#ffd700";

type MenuItem = { key: string; label: string; route?: string; adminOnly?: boolean };

export default function MoreScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me: any = await apiGet("/api/me");
        if (!cancelled) setIsAdmin(!!me?.is_admin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const items: MenuItem[] = [
    { key: "referral", label: "Referral", route: "/referral" },
    { key: "settings", label: "Settings", route: "/settings" },
    { key: "help", label: "Help / FAQ", route: "/help" },
    { key: "about", label: "About", route: "/about" },
    { key: "admin", label: "Admin: Resolve Markets", route: "/admin/resolve", adminOnly: true },
  ];

  const visible = items.filter(i => (i.adminOnly ? isAdmin : true));

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 6 : 16 }]}>
      <Text style={styles.header}>Menu</Text>

      {isAdmin === null ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i.key}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => item.route && router.push(item.route)}>
              <Text style={styles.rowText}>{item.label}</Text>
              <Text style={{ color: GOLD }}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, padding: 16 },
  header: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: { backgroundColor: CARD, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
