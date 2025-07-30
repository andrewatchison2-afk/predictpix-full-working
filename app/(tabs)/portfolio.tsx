import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function PortfolioScreen() {
  // Mock data
  const totalSpent = 300;
  const totalReceived = 450;
  const netOutcome = totalReceived - totalSpent;

  const activeMarkets = [
    { id: 1, question: 'Will Pi reach $10 by 2025?', side: 'Yes', amount: 50 },
    { id: 2, question: 'Will BTC fall below $30k in August?', side: 'No', amount: 100 },
  ];

  const resolvedWon = [
    { id: 3, question: 'Did the Halving occur in April?', side: 'Yes', final: 150 },
  ];

  const resolvedLost = [
    { id: 4, question: 'Did ETH go above $3k in May?', side: 'Yes', final: 0 },
  ];

  const handleSell = (id: number) => {
    Alert.alert('Position Sold', `You exited position #${id}.`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryValue}>{totalSpent} Pi</Text>

        <Text style={styles.summaryLabel}>Total Received</Text>
        <Text style={styles.summaryValue}>{totalReceived} Pi</Text>

        <Text style={styles.summaryLabel}>Net Outcome</Text>
        <Text style={[styles.summaryValue, { color: netOutcome >= 0 ? '#0f0' : '#f00' }]}>
          {netOutcome >= 0 ? '+' : ''}{netOutcome} Pi
        </Text>
      </View>

      {/* Active Markets */}
      <Text style={styles.sectionTitle}>📈 Active Positions</Text>
      {activeMarkets.map((market) => (
        <View key={market.id} style={styles.marketBox}>
          <Text style={styles.marketText}>{market.question}</Text>
          <Text style={styles.side}>Your Side: {market.side}</Text>
          <Text style={styles.amount}>Position Size: {market.amount} Pi</Text>
          <TouchableOpacity
            style={styles.sellButton}
            onPress={() => handleSell(market.id)}
          >
            <Text style={styles.sellButtonText}>Exit Position</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Resolved Won */}
      <Text style={styles.sectionTitle}>✅ Resolved - Positive Outcome</Text>
      {resolvedWon.map((market) => (
        <View key={market.id} style={styles.marketBox}>
          <Text style={styles.marketText}>{market.question}</Text>
          <Text style={styles.side}>Your Side: {market.side}</Text>
          <Text style={styles.amount}>Final Outcome: {market.final} Pi</Text>
        </View>
      ))}

      {/* Resolved Lost */}
      <Text style={styles.sectionTitle}>❌ Resolved - Negative Outcome</Text>
      {resolvedLost.map((market) => (
        <View key={market.id} style={styles.marketBox}>
          <Text style={styles.marketText}>{market.question}</Text>
          <Text style={styles.side}>Your Side: {market.side}</Text>
          <Text style={styles.amount}>Final Outcome: {market.final} Pi</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 16,
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  marketBox: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  marketText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  side: {
    color: '#ccc',
    marginTop: 4,
  },
  amount: {
    color: '#ccc',
    marginTop: 2,
    marginBottom: 6,
  },
  sellButton: {
    backgroundColor: '#8e44ad',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  sellButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
