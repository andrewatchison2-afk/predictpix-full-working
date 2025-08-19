import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

export default function CreateMarketScreen() {
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState<'Standard' | 'Committed' | 'Boosted' | ''>('');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [resolutionCriteria, setResolutionCriteria] = useState('');
  const [resolutionSource, setResolutionSource] = useState('');
  const [liquidity, setLiquidity] = useState('');

  const handleCreate = () => {
    if (!question || !category || !tier || !resolutionCriteria || !resolutionSource || !liquidity) {
      alert('Please fill in all fields');
      return;
    }

    router.push({
      pathname: '/confirm-market',
      params: {
        question,
        category,
        tier,
        endDateString: endDate.toISOString(), // ✅ Correct param name
        resolutionCriteria,
        resolutionSource,
        liquidity,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a New Market</Text>

      <Text style={styles.label}>Question</Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="e.g., Will Pi hit $1 by July 31?"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Pi Coin, Politics"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Choose Tier</Text>
      <View style={styles.tierContainer}>
        {['Standard', 'Committed', 'Boosted'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tierButton, tier === t && styles.selectedTier]}
            onPress={() => setTier(t as typeof tier)}
          >
            <Text style={styles.tierText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{endDate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Resolution Criteria</Text>
      <TextInput
        style={styles.input}
        value={resolutionCriteria}
        onChangeText={setResolutionCriteria}
        placeholder="e.g., Resolves to Yes if..."
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Resolution Source</Text>
      <TextInput
        style={styles.input}
        value={resolutionSource}
        onChangeText={setResolutionSource}
        placeholder="e.g., CoinGecko, Weather.com"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Initial Liquidity (Pi)</Text>
      <TextInput
        style={styles.input}
        value={liquidity}
        onChangeText={setLiquidity}
        keyboardType="numeric"
        placeholder="e.g., 10"
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#000',
    flexGrow: 1,
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#aaa',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  tierContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tierButton: {
    flex: 1,
    backgroundColor: '#222',
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTier: {
    backgroundColor: '#B033F2',
  },
  tierText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#B033F2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
