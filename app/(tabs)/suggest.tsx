// app/(tabs)/suggest.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  Platform, StatusBar
} from "react-native";
import { apiPost, getToken } from "../../lib/api/client";
import { useRouter } from "expo-router";

const BG = "#000";
const CARD = "#1c1c1e";
const GOLD = "#ffd700";

export default function SuggestScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!getToken()) {
      Alert.alert("Login required", "Please log in to submit.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/login") },
      ]);
      return;
    }
    if (!title.trim() || !category.trim()) {
      Alert.alert("Missing info", "Title and Category are required.");
      return;
    }
    try {
      setSubmitting(true);
      await apiPost("/api/suggestions", {
        title: title.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        source: source.trim() || undefined,
      });
      setTitle(""); setCategory(""); setDescription(""); setSource("");
      Alert.alert("Thanks!", "Your suggestion was submitted.");
    } catch (e: any) {
      Alert.alert("Failed", String(e?.message || "Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 6 : 16 }]}>
      <Text style={styles.header}>Suggest a Market</Text>

      <TextInput placeholder="Title *" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Category * (Pi, Crypto, Politics…)" placeholderTextColor="#aaa" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput
        placeholder="Description (optional)" placeholderTextColor="#aaa"
        value={description} onChangeText={setDescription} style={[styles.input, { height: 110, textAlignVertical: "top" }]} multiline
      />
      <TextInput placeholder="Source URL (optional)" placeholderTextColor="#aaa" value={source} onChangeText={setSource} style={styles.input} autoCapitalize="none" />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator /> : <Text style={styles.btnText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, padding: 16 },
  header: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { backgroundColor: CARD, color: "#fff", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  btn: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 6 },
  btnText: { color: "#000", fontWeight: "700" },
});
