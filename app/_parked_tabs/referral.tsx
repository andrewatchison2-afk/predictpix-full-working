import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';

export default function ReferralScreen() {
  // Mock user and referral stats
  const referralCode = 'PIX-9Z12A3';
  const [stats] = useState({
    invites: 12,
    volume: 450,
    earnings: 22.5,
  });

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied', 'Referral code copied to clipboard!');
  };

  const shareReferral = () => {
    Alert.alert(
      'Share',
      `You shared your referral code: ${referralCode} (mock)`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🎁 Referral Program</Text>

        <View style={styles.box}>
          <Text style={styles.label}>Your Referral Code:</Text>
          <Text style={styles.code}>{referralCode}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
              <Text style={styles.buttonText}>Copy Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={shareReferral}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsBox}>
          <Text style={styles.statText}>Invited Users: {stats.invites}</Text>
          <Text style={styles.statText}>
            Volume Generated: {stats.volume} Pi
          </Text>
          <Text style={styles.statText}>
            Estimated Earnings: {stats.earnings} Pi
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  code: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#A020F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
  },
  statText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
});
