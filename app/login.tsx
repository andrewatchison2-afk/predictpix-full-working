import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#999"
        style={{ backgroundColor: '#222', color: 'white', marginBottom: 10, padding: 10, borderRadius: 8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#999"
        style={{ backgroundColor: '#222', color: 'white', marginBottom: 20, padding: 10, borderRadius: 8 }} />
      <TouchableOpacity style={{ backgroundColor: 'purple', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
