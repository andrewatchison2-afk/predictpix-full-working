// app/login.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import everything from the client so we can optionally call setToken if it exists
import * as client from "../lib/api/client";
const { apiPost, getToken } = client as any;

const BG = "#000000";
const CARD = "#1c1c1e";
const GOLD = "#ffd700";
const PURPLE = "#8a2be2";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Optional: prefill for quick testing (delete if you like)
  useEffect(() => {
    // setEmail("test@example.com");
    // setPassword("password");
  }, []);

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter email and password.");
      return;
    }
    try {
      setSubmitting(true);

      // Call your backend login
      const res = await apiPost("/api/auth/email/login", { email, password });

      // If your backend returns a token in JSON, persist it
      const token =
        res?.access_token || res?.token || res?.jwt || res?.accessToken || null;
      if (token && typeof token === "string") {
        // Only call setToken if the client exports it
        (client as any)?.setToken?.(token);
      }

      // 🔎 Debug: see what the app will attach to future requests
      console.log("AUTH TOKEN AFTER LOGIN:", getToken?.());

      // UX: let the user know if we still don't have a token
      if (!getToken?.()) {
        Alert.alert(
          "Logged in",
          "No bearer token detected. If your backend uses cookies for auth, ensure they're allowed in RN and CORS."
        );
      }

      // Navigate back to where the user was (Home will refetch)
      router.replace("/(tabs)/home");
    } catch (e: any) {
      const msg = e?.message || "Login failed";
      Alert.alert("Login failed", String(msg));
      console.log("login error:", msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Optional Pi login (shows a hint if not in Pi Browser)
  function handlePiLogin() {
    Alert.alert(
      "Pi Login",
      "Open this app inside Pi Browser to use Pi login, or continue with Email login."
    );
  }

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <Text style={styles.logo}>
        <Text style={{ color: PURPLE }}>Predict</Text>
        <Text style={{ color: GOLD }}>Pi</Text>
        <Text style={{ color: PURPLE }}>X</Text>
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#8c8c8e"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#8c8c8e"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleEmailLogin}
          style={[styles.btn, { backgroundColor: GOLD, marginTop: 16 }]}
          disabled={submitting}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnTextDark}>Log in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePiLogin}
          style={[styles.btn, { backgroundColor: CARD, marginTop: 10, borderWidth: 1, borderColor: "#2a2a2d" }]}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>Log in with Pi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.btn, { backgroundColor: CARD, marginTop: 10 }]}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 16 },
  logo: { fontSize: 28, fontWeight: "bold", alignSelf: "center", marginBottom: 16, marginTop: 4 },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 16 },
  label: { color: "#cfcfd2", fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#151517",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2a2a2d",
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextDark: { color: "#000", fontWeight: "700" },
});
