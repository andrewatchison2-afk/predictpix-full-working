// app/(tabs)/home.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getToken } from "../../lib/api/client";
import { listMarkets, NormalizedMarket, createOrder } from "../../lib/api/markets";

const PURPLE = "#8a2be2";   // Predict + X
const GOLD = "#ffd700";     // Pi
const BG = "#000000";
const CARD_BG = "#1c1c1e";

const CATEGORIES = ["All", "Pi", "Crypto", "Politics", "Tech", "Sports-safe", "Macro", "Pop Culture", "Science"];

// --- Preview markets shown if backend is empty/down ---
const MOCK_MARKETS: NormalizedMarket[] = [
  { id: "m-ppx-500dau", title: "Will PredictPiX reach 500 daily users within 30 days?", category: "Pi", tags: ["Pi","Growth"], yesProb: 0.41, volume24h: 320, status: "active", raw: {} },
  { id: "m-btc-80k", title: "Will Bitcoin close above $80,000 on Aug 31?", category: "Crypto", tags: ["Crypto","Bitcoin"], yesProb: 0.62, volume24h: 1240, status: "active", raw: {} },
  { id: "m-eth-etf", title: "Will ETH ETF approvals expand by Q4 2025?", category: "Crypto", tags: ["Crypto","ETF"], yesProb: 0.58, volume24h: 860, status: "active", raw: {} },
  { id: "m-foldable", title: "Will a foldable iPhone be announced this year?", category: "Tech", tags: ["Tech","Apple"], yesProb: 0.27, volume24h: 220, status: "active", raw: {} },
  { id: "m-artemis2", title: "Will Artemis II launch before Dec 31, 2025?", category: "Science", tags: ["Science","Space"], yesProb: 0.46, volume24h: 540, status: "active", raw: {} },
  { id: "m-cpi-sept", title: "Will US CPI YoY exceed 3.5% in September?", category: "Macro", tags: ["Macro","Inflation"], yesProb: 0.33, volume24h: 410, status: "active", raw: {} },
];

type BuySheetState = {
  open: boolean;
  market?: NormalizedMarket;
  side?: "yes" | "no";
  qty?: string;
  submitting?: boolean;
};

function useAuthGate(router: ReturnType<typeof useRouter>) {
  return (next: () => void) => {
    const t = getToken();
    if (!t) {
      Alert.alert("Login required", "Please log in to continue.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/login") },
      ]);
      return;
    }
    next();
  };
}

// Utility: fetch with timeout so we never hang forever
async function withTimeout<T>(p: Promise<T>, ms = 7000): Promise<T> {
  return await Promise.race<T>([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("request timeout")), ms)) as any,
  ]);
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authGate = useAuthGate(router);

  // UI state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  // Data state
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NormalizedMarket[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [softMsg, setSoftMsg] = useState("");

  // Buy sheet
  const [buy, setBuy] = useState<BuySheetState>({ open: false });

  // avoid overlapping loads
  const loadLock = useRef(false);

  const catParam = useMemo(
    () => (category === "All" ? undefined : category.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")),
    [category]
  );

  const loadPage1 = useCallback(async () => {
    if (loadLock.current) return;
    loadLock.current = true;
    setInitialLoading(true);
    setSoftMsg("");

    try {
      const res = await withTimeout(listMarkets({ page: 1, category: catParam }), 7000);
      if (!res.items || res.items.length === 0) {
        // Empty feed → show preview to avoid a blank screen
        setItems(MOCK_MARKETS);
        setHasMore(false);
        setSoftMsg("Showing preview markets — connect backend for live data.");
      } else {
        setItems(res.items);
        setHasMore(res.hasMore);
        setPage(1);
      }
    } catch (err: any) {
      console.log("markets.load error", err?.message || err);
      setItems(MOCK_MARKETS);
      setHasMore(false);
      setSoftMsg("Live feed unavailable — showing preview markets.");
    } finally {
      setInitialLoading(false);
      loadLock.current = false;
    }
  }, [catParam]);

  const loadMore = useCallback(async () => {
    if (loadingMore || initialLoading || !hasMore || loadLock.current) return;
    loadLock.current = true;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await withTimeout(listMarkets({ page: next, category: catParam }), 7000);
      setItems((prev) => [...prev, ...(res.items || [])]);
      setHasMore(!!res.hasMore);
      setPage(next);
    } catch (err) {
      console.log("markets.loadMore error", String((err as any)?.message || err));
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      loadLock.current = false;
    }
  }, [loadingMore, initialLoading, hasMore, page, catParam]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage1();
    setRefreshing(false);
  }, [loadPage1]);

  useEffect(() => {
    loadPage1();
  }, [loadPage1]);

  const data = useMemo(() => {
    const sentinel = [{ __type: "chips" } as any];
    const filtered = search.trim()
      ? items.filter((m) => m.title.toLowerCase().includes(search.trim().toLowerCase()))
      : items;
    return [...sentinel, ...filtered];
  }, [items, search]);

  const onBuyPress = (m: NormalizedMarket, side: "yes" | "no") =>
    authGate(() => setBuy({ open: true, market: m, side, qty: "" }));

  const submitBuy = async () => {
    if (!buy.market || !buy.side) return;
    const qtyNum = Number(buy.qty);
    if (!(qtyNum > 0)) {
      Alert.alert("Enter amount", "Please enter a quantity greater than zero.");
      return;
    }
    try {
      setBuy((s) => ({ ...s, submitting: true }));
      // ✅ send real backend id when available
      await createOrder({
        market_id: (buy.market.raw?.id ?? buy.market.id) as any,
        side: buy.side!,
        quantity: qtyNum,
      });
      setBuy({ open: false });
      Alert.alert("Success", "Your order was placed.");
    } catch (e: any) {
      Alert.alert("Order failed", String(e?.message || "Please try again."));
    } finally {
      setBuy((s) => ({ ...s, submitting: false }));
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item?.__type === "chips") {
      return (
        <View style={styles.chipsWrap}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(c) => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
            renderItem={({ item: c }) => {
              const selected = c === category;
              return (
                <TouchableOpacity onPress={() => setCategory(c)} style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{c}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }

    const m = item as NormalizedMarket;
    const yes = Math.round((m.yesProb ?? 0.5) * 100);
    const no = 100 - yes;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: "/market/[id]", params: { id: String(m.id) } })}
        activeOpacity={0.85}
      >
        <Text numberOfLines={2} style={styles.title}>{m.title}</Text>
        <View style={styles.sparkline} />
        <View style={styles.percentRow}>
          <Text style={styles.yesPct}>{yes}% Yes</Text>
          <Text style={styles.noPct}>{no}% No</Text>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.buyYes} onPress={() => onBuyPress(m, "yes")}>
            <Text style={styles.btnTextDark}>Buy Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNo} onPress={() => onBuyPress(m, "no")}>
            <Text style={styles.btnText}>Buy No</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.micro}>{m.tags?.join(" · ") || m.category || "—"} · Vol 24h {m.volume24h ?? "—"}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* App bar */}
      <View style={styles.appbar}>
        <Text style={styles.logo}>
          <Text style={{ color: PURPLE }}>Predict</Text>
          <Text style={{ color: GOLD }}>Pi</Text>
          <Text style={{ color: PURPLE }}>X</Text>
        </Text>
        <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginBtn} activeOpacity={0.8}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search markets…"
        placeholderTextColor="#aaa"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* Feed */}
      {initialLoading ? (
        <ActivityIndicator size="large" color={PURPLE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => (item?.__type === "chips" ? "chips" : String((item as NormalizedMarket).id ?? i))}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<Text style={styles.empty}>No markets.</Text>}
          ListFooterComponent={
            loadingMore ? <Text style={styles.footer}>Loading…</Text> : !!softMsg ? <Text style={[styles.footer, { color: "#ffb4b4" }]}>{softMsg}</Text> : null
          }
          stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
        />
      )}

      {/* Buy modal */}
      <Modal visible={buy.open} animationType="slide" transparent onRequestClose={() => setBuy({ open: false })}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{buy.side === "yes" ? "Buy Yes" : "Buy No"}</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>{buy.market?.title ?? ""}</Text>

            <TextInput
              placeholder="Quantity (Pi)"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={buy.qty ?? ""}
              onChangeText={(t) => setBuy((s) => ({ ...s, qty: t }))}
              style={styles.modalInput}
            />

            <View style={{ height: 12 }} />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: GOLD }]} disabled={!!buy.submitting} onPress={submitBuy}>
              {buy.submitting ? <ActivityIndicator /> : <Text style={[styles.btnTextDark, { fontWeight: "700" }]}>Confirm</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: CARD_BG, marginTop: 8 }]} onPress={() => setBuy({ open: false })}>
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
  appbar: { paddingHorizontal: 16, paddingBottom: 8, alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  logo: { fontSize: 28, fontWeight: "bold" },
  loginBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: GOLD, backgroundColor: "transparent" },
  loginText: { color: GOLD, fontWeight: "700", fontSize: 14 },

  search: {
    backgroundColor: CARD_BG, marginHorizontal: 16, borderRadius: 10, color: "#fff",
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8
  },
  chipsWrap: { backgroundColor: BG, paddingVertical: 8 },
  chip: { backgroundColor: CARD_BG, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  chipSelected: { backgroundColor: PURPLE },
  chipText: { color: "#aaa", fontSize: 14 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },

  card: { backgroundColor: CARD_BG, marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12 },
  title: { color: "#fff", fontSize: 14, fontWeight: "600" },
  sparkline: { height: 28, marginTop: 8, marginBottom: 8, borderRadius: 6, backgroundColor: "#2a2a2d" },

  percentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  yesPct: { color: GOLD, fontSize: 20, fontWeight: "700" },
  noPct: { color: "#bfa3ff", fontSize: 20, fontWeight: "700" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  buyYes: { flex: 1, backgroundColor: GOLD, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  buyNo: { flex: 1, backgroundColor: PURPLE, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextDark: { color: "#000", fontWeight: "700" },

  micro: { color: "#ccc", fontSize: 11, marginTop: 10 },
  footer: { color: "#888", textAlign: "center", paddingVertical: 12 },
  empty: { color: "#888", textAlign: "center", marginTop: 24 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalCard: { width: "100%", backgroundColor: BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#222" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalSubtitle: { color: "#aaa", fontSize: 12, marginTop: 6 },
  modalInput: { backgroundColor: CARD_BG, color: "#fff", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginTop: 12 },
  modalBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
});
