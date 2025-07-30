import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';

// ✅ Unified PredictPix purple
const PURPLE = '#B033F2';

const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [amount, setAmount] = useState('');

  const categories = ['All', 'Trending', 'Newest', 'Pi Coin', 'Politics', 'Crypto', 'Weather'];

  const allMarkets = [
    { id: '1', title: 'Will Pi Network hit $10 by 2025?', category: 'Pi Coin', yes: 62, no: 38 },
    { id: '2', title: 'Will Bitcoin close above $30k on Friday?', category: 'Crypto', yes: 65, no: 35 },
    { id: '3', title: 'Will Trump win the 2024 election?', category: 'Politics', yes: 40, no: 60 },
    { id: '4', title: 'Will Ethereum gas fees drop below $5?', category: 'Crypto', yes: 70, no: 30 },
    { id: '5', title: 'Will it rain in London tomorrow?', category: 'Weather', yes: 55, no: 45 },
    { id: '6', title: 'Will gold hit $2,200 this month?', category: 'Trending', yes: 61, no: 39 },
    { id: '7', title: 'Will the S&P 500 hit a new ATH this year?', category: 'Trending', yes: 66, no: 34 },
    { id: '8', title: 'Will DOGE double in price by August?', category: 'Crypto', yes: 58, no: 42 },
    { id: '9', title: 'Will Pi Coin be listed on Binance in 2025?', category: 'Pi Coin', yes: 77, no: 23 },
    { id: '10', title: 'Will a major country ban crypto in 2025?', category: 'Politics', yes: 33, no: 67 },
  ];

  const filteredMarkets = allMarkets.filter((market) => {
    const matchesSearch = market.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      market.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleBuy = (market, side) => {
    setSelectedMarket(market);
    setSelectedSide(side);
    setAmount('');
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={{ color: PURPLE }}>Predict</Text>
          <Text style={{ color: 'gold' }}>Pi</Text>
          <Text style={{ color: PURPLE }}>X</Text>
        </Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => alert('Mock login')}>
          <Text style={styles.loginText}>Login with Pi</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search markets..."
        placeholderTextColor="#aaa"
        style={styles.searchBar}
        value={search}
        onChangeText={setSearch}
      />

      {/* Categories */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.selectedText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Market Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredMarkets.map((market) => (
          <View key={market.id} style={styles.marketCard}>
            <Text style={styles.marketTitle}>{market.title}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buyYes}
                onPress={() => handleBuy(market, 'yes')}
              >
                <Text style={styles.buttonText}>Buy Yes ({market.yes}%)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyNo}
                onPress={() => handleBuy(market, 'no')}
              >
                <Text style={styles.buttonText}>Buy No ({market.no}%)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Buy Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Place Order</Text>
            <Text style={styles.modalText}>
              {selectedSide === 'yes' ? 'Buy Yes' : 'Buy No'} on:
            </Text>
            <Text style={styles.modalMarket}>{selectedMarket?.title}</Text>
            <TextInput
              placeholder="Enter amount (Pi)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBar: {
    backgroundColor: '#1c1c1e',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 10,
    color: '#fff',
    marginBottom: 10,
  },
  categoryWrapper: {
    paddingLeft: 10,
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: PURPLE,
  },
  categoryText: {
    color: '#aaa',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 160,
  },
  marketCard: {
    backgroundColor: '#1c1c1e',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 10,
  },
  marketTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buyYes: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  buyNo: {
    backgroundColor: PURPLE,
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
  },
  modalMarket: {
    marginTop: 8,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#eee',
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default HomeScreen;
