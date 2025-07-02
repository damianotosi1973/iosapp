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
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const API_KEY = 'AIzaSyBK32o_Egk41DEh3_bFJAvDUhCWdlJYLlU';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🟢 Controllo se già loggato
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('idToken');
      const ruolo = await AsyncStorage.getItem('ruolo');
      const loggedIn = await AsyncStorage.getItem('loggedIn');

      if (token && ruolo && loggedIn === 'true') {
        navigation.replace('Home');
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        const uid = data.localId;
        const token = data.idToken;

        // 🔐 Salva token
        await AsyncStorage.setItem('idToken', token);

        // 🔎 Recupera ruolo utente
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const ruolo = snap.data().role;
          if (ruolo === 'gestore' || ruolo === 'autista') {
            await AsyncStorage.setItem('ruolo', ruolo);
            await AsyncStorage.setItem('loggedIn', 'true');
            navigation.replace('Home');
          } else {
            Alert.alert('Errore', 'Ruolo utente non valido');
          }
        } else {
          Alert.alert('Errore', 'Utente non trovato su Firestore');
        }
      } else {
        Alert.alert('Errore', data.error?.message || 'Login fallito');
      }
    } catch {
      Alert.alert('Errore', 'Connessione non riuscita');
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
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Accedi" onPress={handleLogin} />
      )}
    </View>
  );
};

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

export default LoginScreen;
