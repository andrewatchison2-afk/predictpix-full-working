// app/market/[id].tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMarket, NormalizedMarket, createOrder } from "../../lib/api/markets";
import { getToken } from "../../lib/api/client";

const PURPLE = "#8a2be2";
const GOLD = "#ffd700";
const BG = "#000000";
const CARD_BG = "#1c1c1e";

export default function MarketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [m, setM] = useState<NormalizedMarket | null>(null);
  const [err, setErr] = useState<string>("");

  const [qty, setQty] = useState("");
  const [side, setSide] = useState<"yes" | "no" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const mm = await getMarket(id!);
        if (!cancelled) setM(mm);
        if (!mm && !cancelled) setErr("Unable to load market details.");
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message || "Unable to load market details."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const yes = Math.round(((m?.yesProb ?? 0.5) * 100));
  const no = 100 - yes;

  function requireAuth(next: () => void) {
    const t = getToken();
    if (!t) {
      Alert.alert("Login required", "Please log in to trade.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/login") },
      ]);
      return;
    }
    next();
  }

  async function onConfirm() {
    if (!m || !side) return;
    const n = Number(qty);
    if (!(n > 0)) {
      Alert.alert("Enter amount", "Please enter a quantity greater than zero.");
      return;
    }
    try {
      setSubmitting(true);
      // ✅ send real backend id when available
      await createOrder({
        market_id: (m.raw?.id ?? m.id) as any,
        side,
        quantity: n,
      });
      setSheetOpen(false);
      setQty("");
      setSide(null);
      Alert.alert("Success", "Your order was placed.");
    } catch (e: any) {
      Alert.alert("Order failed", String(e?.message || "Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>
          <Text style={{ color: PURPLE }}>Predict</Text>
          <Text style={{ color: GOLD }}>Pi</Text>
          <Text style={{ color: PURPLE }}>X</Text>
        </Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PURPLE} style={{ marginTop: 40 }} />
      ) : !m ? (
        <Text style={styles.error}>{err || "Market not found."}</Text>
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.title}>{m.title}</Text>
          <View style={styles.sparkline} />
          <View style={styles.percentRow}>
            <Text style={styles.yesPct}>{yes}% Yes</Text>
            <Text style={styles.noPct}>{no}% No</Text>
          </View>
          <Text style={styles.meta}>
            {(m.tags?.join(" · ") || m.category || "—")} · Vol 24h {m.volume24h ?? "—"}
          </Text>

          <View style={{ height: 10 }} />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: GOLD }]}
              onPress={() => requireAuth(() => { setSide("yes"); setSheetOpen(true); })}
            >
              <Text style={styles.btnTextDark}>Buy Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: PURPLE }]}
              onPress={() => requireAuth(() => { setSide("no"); setSheetOpen(true); })}
            >
              <Text style={styles.btnText}>Buy No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={sheetOpen} animationType="slide" transparent onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{side === "yes" ? "Buy Yes" : "Buy No"}</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>{m?.title ?? ""}</Text>

            <TextInput
              placeholder="Quantity (Pi)"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={qty}
              onChangeText={setQty}
              style={styles.modalInput}
            />

            <View style={{ height: 12 }} />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: GOLD }]} onPress={onConfirm} disabled={submitting}>
              {submitting ? <ActivityIndicator /> : <Text style={[styles.btnTextDark, { fontWeight: "700" }]}>Confirm</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: CARD_BG, marginTop: 8 }]} onPress={() => setSheetOpen(false)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  back: { color: "#fff", fontSize: 16 },
  logo: { fontSize: 20, fontWeight: "bold" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 6 },
  sparkline: { height: 30, marginTop: 8, marginBottom: 10, borderRadius: 6, backgroundColor: "#2a2a2d" },
  percentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  yesPct: { color: GOLD, fontSize: 22, fontWeight: "700" },
  noPct: { color: "#bfa3ff", fontSize: 22, fontWeight: "700" },
  meta: { color: "#ccc", fontSize: 12, marginTop: 8 },

  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextDark: { color: "#000", fontWeight: "700" },

  error: { color: "#ffb4b4", textAlign: "center", marginTop: 24 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalCard: { width: "100%", backgroundColor: BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#222" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalSubtitle: { color: "#aaa", fontSize: 12, marginTop: 6 },
  modalInput: { backgroundColor: CARD_BG, color: "#fff", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginTop: 12 },
  modalBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
});
