
// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { apiGet } from "../../lib/api/client";
import { setAuthToken } from "../../lib/auth/store";

type UserInfo = { email?: string; username?: string; role?: string; is_admin?: boolean; isAdmin?: boolean; };

export default function ProfileScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await apiGet<UserInfo>("/api/auth/validate");
        if (!cancelled) setUser(info);
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message || "Failed to load profile"));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onLogout = () => {
    setAuthToken(null);
    Alert.alert("Logged out", "Token cleared.");
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.h1}>Profile</Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        <Text style={styles.kv}><Text style={styles.k}>Email:</Text> <Text style={styles.v}>{user?.email || "—"}</Text></Text>
        <Text style={styles.kv}><Text style={styles.k}>Username:</Text> <Text style={styles.v}>{user?.username || "—"}</Text></Text>
        <Text style={styles.kv}><Text style={styles.k}>Role:</Text> <Text style={styles.v}>{user?.role || ((user?.is_admin || user?.isAdmin) ? "admin" : "user")}</Text></Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onLogout}>
        <Text style={styles.btnT}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", padding: 16 },
  h1: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#1c1c1e", borderRadius: 12, padding: 14, marginBottom: 12 },
  kv: { color: "#ddd", marginBottom: 6 },
  k: { color: "#aaa" },
  v: { color: "#fff" },
  btn: { alignSelf: "flex-start", backgroundColor: "#FFD700", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnT: { color: "#000", fontWeight: "bold" },
  err: { color: "tomato", marginBottom: 8 },
});
