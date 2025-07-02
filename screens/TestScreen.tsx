import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';

export default function TestScreen() {
  const [destinatario, setDestinatario] = useState('');

  const salva = () => {
    console.log('🚀 Funzione SALVA eseguita!');
    Alert.alert('SALVATO!', `Hai inserito: ${destinatario}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>📦 Destinatario</Text>
      <TextInput
        style={styles.input}
        value={destinatario}
        onChangeText={setDestinatario}
        placeholder="Es. Mario Rossi"
      />
      <View style={styles.btn}>
        <Button title="Salva" onPress={salva} color="#66cc66" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#111' },
  label: { color: '#ccc', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  btn: { marginTop: 10 },
});
