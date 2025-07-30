import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PURPLE = '#B033F2';
const CARD_BG = '#1c1c1e';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Your Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={PURPLE} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>pi_user_123</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Total Markets Created</Text>
          <Text style={styles.value}>6</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Referral Code</Text>
          <Text style={styles.value}>PIX-REF-9876</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Type</Text>
          <Text style={styles.value}>Pioneer</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
