// app/market/[id].tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Modal from 'react-native-modal';

export default function MarketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'Yes' | 'No' | null>(null);
  const [amount, setAmount] = useState('');

  const market = {
    id,
    question: 'Will Bitcoin close above $30k on Friday?',
    description:
      'This market resolves based on the price of BTC at 11:59pm UTC on Friday. Price will be verified via CoinGecko.',
    oddsYes: 65,
    oddsNo: 35,
    endDate: 'August 2, 2025',
    volume: '134 Pi',
  };

  const openModal = (side: 'Yes' | 'No') => {
    setSelectedSide(side);
    setModalVisible(true);
  };

  const confirmBuy = () => {
    alert(`Bought ${selectedSide} for ${amount} Pi (mock transaction)`);
    setModalVisible(false);
    setAmount('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{market.question}</Text>

        <Text style={styles.label}>Market Description</Text>
        <Text style={styles.body}>{market.description}</Text>

        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Odds Yes</Text>
            <Text style={styles.value}>{market.oddsYes}%</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Odds No</Text>
            <Text style={styles.value}>{market.oddsNo}%</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Ends</Text>
            <Text style={styles.value}>{market.endDate}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Total Volume</Text>
            <Text style={styles.value}>{market.volume}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: '#FFD700' }]}
            onPress={() => openModal('Yes')}
          >
            <Text style={styles.buyText}>Buy Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: '#A020F0' }]}
            onPress={() => openModal('No')}
          >
            <Text style={styles.buyText}>Buy No</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Buy {selectedSide}</Text>
          <Text style={styles.modalLabel}>Enter Pi Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 20"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity style={styles.confirmButton} onPress={confirmBuy}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  body: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 20,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 12,
    marginRight: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buyButton: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#A020F0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
