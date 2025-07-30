import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ConfirmMarketScreen() {
  const router = useRouter();
  const {
    question,
    category,
    expiration,
    tier,
    seedAmount,
    verificationSource,
    resolutionCriteria,
  } = useLocalSearchParams();

  const handleConfirm = () => {
    // Simulate market submission (backend call goes here later)
    alert('Market created successfully!');
    router.push('/(tabs)/home'); // Go back to home or portfolio
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Preview Your Market</Text>

      <View style={styles.previewBox}>
        <Text style={styles.label}>Question</Text>
        <Text style={styles.value}>{question}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{category}</Text>

        <Text style={styles.label}>Expiration</Text>
        <Text style={styles.value}>{new Date(expiration as string).toDateString()}</Text>

        <Text style={styles.label}>Tier</Text>
        <Text style={styles.value}>{tier} Tier</Text>

        {seedAmount ? (
          <>
            <Text style={styles.label}>Seed Pi</Text>
            <Text style={styles.value}>{seedAmount} Pi</Text>
          </>
        ) : null}

        <Text style={styles.label}>Outcome Verification</Text>
        <Text style={styles.value}>{verificationSource}</Text>

        <Text style={styles.label}>Resolution Criteria</Text>
        <Text style={styles.value}>{resolutionCriteria}</Text>
      </View>

      <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
        <Text style={styles.confirmText}>✅ Confirm & Create Market</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Go Back & Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  previewBox: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 14,
    borderRadius: 10,
    borderColor: '#444',
    borderWidth: 1,
  },
  backText: {
    color: '#ccc',
    textAlign: 'center',
  },
});
