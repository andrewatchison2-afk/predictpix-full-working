import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const markets = [
  { id: 1, question: 'Will Bitcoin close above $60k this week?', yes: 72, no: 28, tag: 'Crypto' },
  { id: 2, question: 'Will AI pass the Turing Test by 2026?', yes: 31, no: 69, tag: 'Tech' },
  { id: 3, question: 'Will Trump win the 2024 election?', yes: 45, no: 55, tag: 'Politics' },
  { id: 4, question: 'Will Pi Coin reach $10 by 2026?', yes: 60, no: 40, tag: 'Pi Network' },
];

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Predict</Text>
        <Text style={[styles.header, styles.gold]}>Pi</Text>
        <Text style={[styles.header, styles.purple]}>X</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search markets..."
        placeholderTextColor="#999"
      />

      <ScrollView>
        {markets.map((market) => (
          <View key={market.id} style={styles.card}>
            <Text style={styles.question}>{market.question}</Text>
            <Text style={styles.tag}>{market.tag}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.yes}>
                <Text style={styles.btnText}>Yes ({market.yes}%)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.no}>
                <Text style={styles.btnText}>No ({market.no}%)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 12, paddingTop: 50 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  gold: { color: '#FFD700' },
  purple: { color: '#6A0DAD' },
  search: {
    backgroundColor: '#1F1F1F',
    color: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  question: { fontSize: 16, color: '#FFF', marginBottom: 8 },
  tag: { fontSize: 12, color: '#AAA', marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  yes: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  no: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnText: { color: '#000', fontWeight: 'bold' },
});
