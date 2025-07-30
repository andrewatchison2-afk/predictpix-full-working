import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

export default function CreateMarketScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('Standard');
  const [seedAmount, setSeedAmount] = useState('');
  const [verificationSource, setVerificationSource] = useState('');
  const [resolutionCriteria, setResolutionCriteria] = useState('');
  const [expiration, setExpiration] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tiers = {
    Standard: 10,
    Committed: 25,
    Boosted: 50
  };

  const handlePreview = () => {
    router.push({
      pathname: '/confirm-market',
      params: {
        question,
        category,
        expiration: expiration.toISOString(),
        tier,
        seedAmount,
        verificationSource,
        resolutionCriteria
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Market Question</Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="e.g., Will Pi hit $10 by 2025?"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Pi Coin, Politics"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Expiration Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
        <Text>{expiration.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={expiration}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || expiration;
            setShowDatePicker(Platform.OS === 'ios');
            setExpiration(currentDate);
          }}
        />
      )}

      <Text style={styles.label}>Select Market Tier</Text>
      {Object.keys(tiers).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => setTier(t)}
          style={[
            styles.tierOption,
            tier === t && styles.tierSelected
          ]}
        >
          <Text style={tier === t ? styles.tierTextSelected : styles.tierText}>
            {t} ({tiers[t]} Pi)
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Seed Market? (Optional Pi)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={seedAmount}
        onChangeText={setSeedAmount}
        placeholder="e.g., 100"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Outcome Verification</Text>
      <TextInput
        style={styles.input}
        value={verificationSource}
        onChangeText={setVerificationSource}
        placeholder="e.g., CoinMarketCap"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Market Resolution Criteria</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={resolutionCriteria}
        onChangeText={setResolutionCriteria}
        placeholder="Explain how the market will resolve..."
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity onPress={handlePreview} style={styles.previewButton}>
        <Text style={styles.previewButtonText}>Continue to Preview</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 4
  },
  dateBtn: {
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    marginTop: 4
  },
  tierOption: {
    padding: 10,
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#222'
  },
  tierSelected: {
    backgroundColor: '#8e44ad'
  },
  tierText: {
    color: '#fff'
  },
  tierTextSelected: {
    color: '#fff',
    fontWeight: 'bold'
  },
  previewButton: {
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 60
  },
  previewButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
