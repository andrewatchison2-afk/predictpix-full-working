// app/confirm-market.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";

export default function ConfirmMarketScreen() {
  const params = useLocalSearchParams<{ id?: string; title?: string }>();

  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Market Submitted</Text>
      {!!params?.title && <Text style={styles.body}>Title: <Text style={styles.bold}>{params.title}</Text></Text>}
      {!!params?.id && <Text style={styles.body}>ID: <Text style={styles.bold}>{params.id}</Text></Text>}
      <Text style={[styles.body, { marginTop: 10 }]}>
        You can return to <Link href="/(tabs)/home" style={styles.link}>Home</Link> or open the market detail once it’s available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", padding: 16, justifyContent: "center" },
  h1: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  body: { color: "#ddd", textAlign: "center" },
  bold: { color: "#fff", fontWeight: "600" },
  link: { color: "#FFD700", fontWeight: "bold" },
});
