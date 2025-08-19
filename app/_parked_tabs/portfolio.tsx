// app/(tabs)/portfolio.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { apiGet } from "../../lib/api/client";

type UserInfo = {
  id?: string | number;
  email?: string;
  username?: string;
  role?: string;
  is_admin?: boolean;
  isAdmin?: boolean;
};

export default function PortfolioScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await apiGet<UserInfo>("/api/auth/validate");
        if (!cancelled) setUser(info);
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message || "Failed to load user"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const admin = !!(user?.is_admin || user?.isAdmin || (user?.role || "").toLowerCase() === "admin");

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Your Portfolio</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#B033F2" style={{ marginTop: 24 }} />
        ) : err ? (
          <Text style={styles.err}>{err}</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.kv}><Text style={styles.k}>Email:</Text> <Text style={styles.v}>{user?.email || "—"}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Username:</Text> <Text style={styles.v}>{user?.username || "—"}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Role:</Text> <Text style={styles.v}>{user?.role || (admin ? "admin" : "user")}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Admin:</Text> <Text style={styles.v}>{admin ? "Yes" : "No"}</Text></Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.h2}>Positions</Text>
          <Text style={styles.body}>
            This section will show your open positions, P/L, and history once the backend
            read endpoint (e.g., /api/users/me/portfolio) is ready.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  h1: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  h2: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  body: { color: "#ddd" },
  err: { color: "tomato", marginTop: 16 },
  card: { backgroundColor: "#1c1c1e", borderRadius: 12, padding: 14, marginBottom: 12 },
  kv: { color: "#ddd", marginBottom: 6 },
  k: { color: "#aaa" },
  v: { color: "#fff" },
});
