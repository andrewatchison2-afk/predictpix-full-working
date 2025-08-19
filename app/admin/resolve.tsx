// app/admin/resolve.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { apiGet, apiPost } from "../../lib/api/client";

type MarketLite = { id: string | number; title?: string; question?: string; name?: string };

function labelOf(m: MarketLite, idx: number) {
  return String(m?.title ?? m?.question ?? m?.name ?? `Market ${idx + 1}`);
}

export default function AdminResolveScreen() {
  const router = useRouter();

  // admin gate
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // list state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketLite[]>([]);
  const [error, setError] = useState<string>("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<MarketLite | null>(null);
  const [outcome, setOutcome] = useState<"yes" | "no" | "invalid" | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // check admin
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setChecking(true);
        const me: any = await apiGet("/api/me");
        if (!cancelled) setIsAdmin(!!me?.is_admin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // load unresolved markets
  async function load() {
    setLoading(true);
    setError("");
    try {
      const res: any = await apiGet("/api/admin/markets/unresolved");
      const arr: any[] =
        Array.isArray(res) ? res :
        Array.isArray(res?.items) ? res.items :
        Array.isArray(res?.results) ? res.results :
        Array.isArray(res?.data) ? res.data : [];
      setItems(arr);
    } catch (e: any) {
      setError(String(e?.message || "Failed to load unresolved markets."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  function openModal(m: MarketLite) {
    setSelected(m);
    setOutcome(null);
    setNotes("");
    setProofUrl("");
    setModalOpen(true);
  }

  async function submit() {
    if (!selected || !outcome) {
      Alert.alert("Choose outcome", "Pick Yes / No / Invalid.");
      return;
    }
    try {
      setSubmitting(true);
      await apiPost("/api/admin/markets/resolve", {
        id: selected.id,
        outcome,
        notes: notes || undefined,
        proof_url: proofUrl || undefined,
      });
      setModalOpen(false);
      setSelected(null);
      Alert.alert("Resolved", "Market updated successfully.");
      await load();
    } catch (e: any) {
      Alert.alert("Failed", String(e?.message || "Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>Checking admin access…</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin Only</Text>
        <Text style={styles.hint}>You don’t have permission to resolve markets.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Resolve Markets</Text>

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={[styles.hint, { color: "#ffb4b4" }]}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.hint}>No unresolved markets 🎉</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(m, i) => String((m as any).id ?? i)}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {labelOf(item, index)}
              </Text>
              <Text style={styles.cardHint}>ID: {String((item as any).id)}</Text>
              <Text style={[styles.cardHint, { marginTop: 6 }]}>Tap to resolve</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Resolve Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.modalTitle}>Resolve Market</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {selected ? labelOf(selected, 0) : ""}
            </Text>

            <View style={styles.row}>
              {(["yes", "no", "invalid"] as const).map((opt) => {
                const active = outcome === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setOutcome(opt)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt === "yes" ? "Yes" : opt === "no" ? "No" : "Invalid"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Notes (optional)"
              placeholderTextColor="#aaa"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              multiline
            />
            <TextInput
              placeholder="Proof URL (optional)"
              placeholderTextColor="#aaa"
              value={proofUrl}
              onChangeText={setProofUrl}
              style={styles.input}
              autoCapitalize="none"
            />

            <TouchableOpacity style={[styles.btn, { marginTop: 8 }]} disabled={submitting} onPress={submit}>
              {submitting ? <ActivityIndicator /> : <Text style={styles.btnText}>Submit</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnGhost, { marginTop: 8 }]} onPress={() => setModalOpen(false)}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const BG = "#000";
const CARD = "#1c1c1e";
const GOLD = "#ffd700";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BG, padding: 16 },
  header: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  hint: { color: "#aaa", fontSize: 14, textAlign: "center", marginTop: 6 },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 12 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardHint: { color: "#aaa", fontSize: 12 },
  btn: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", alignSelf: "center", marginTop: 12 },
  btnText: { color: "#000", fontWeight: "700" },
  btnGhost: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", alignSelf: "center" },
  btnGhostText: { color: "#fff", fontWeight: "700" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  sheet: { width: "100%", backgroundColor: BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#222" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalSubtitle: { color: "#aaa", fontSize: 12, marginTop: 6, marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: CARD, marginRight: 8 },
  chipActive: { backgroundColor: GOLD },
  chipText: { color: "#aaa", fontSize: 14 },
  chipTextActive: { color: "#000", fontWeight: "700" },
  input: { backgroundColor: CARD, color: "#fff", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
});
