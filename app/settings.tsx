import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="person-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="notifications-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>Security</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="color-palette-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="help-circle-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>Help & Support</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="information-circle-outline" size={20} color="#ccc" />
        <Text style={styles.itemText}>About PredictPiX</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  itemText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
});
