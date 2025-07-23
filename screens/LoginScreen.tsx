import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RootStackParamList } from '../types/navigation';

const auth = getAuth();

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔍 Controlla login persistente
  useEffect(() => {
    const check = async () => {
      const logged = await AsyncStorage.getItem('loggedIn');
      const ruolo = await AsyncStorage.getItem('ruolo');
      if (logged === 'true' && ruolo) {
        navigation.replace('Home');
      }
    };
    check();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const token = await cred.user.getIdToken();
      const uid = cred.user.uid;

      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) throw new Error('Utente non trovato');

      const ruolo = snap.data().role;
      const ruoliConsentiti = ['gestore', 'autista', 'amministratore'];

      if (!ruoliConsentiti.includes(ruolo)) throw new Error('Ruolo non autorizzato');

      // 🧠 Salva localmente
      await AsyncStorage.multiSet([
        ['idToken', token],
        ['ruolo', ruolo],
        ['loggedIn', 'true'],
      ]);

      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Errore', err.message || 'Accesso fallito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : (
        <Button title="Accedi" onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
});