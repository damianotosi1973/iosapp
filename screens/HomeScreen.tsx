import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useLayoutEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';



type Consegna = {
  id: string;
  destinatario: string;
  luogo: string;
  tipoProdotto: string;
  quantita: number;
  orario?: string;
  note?: string;
  effettuata: boolean;
  data: Timestamp;
};

type Raggruppo = {
  giorno: string;
  consegne: Consegna[];
};

export default function HomeScreen() {
  const [gruppi, setGruppi] = useState<Raggruppo[]>([]);
  const [loading, setLoading] = useState(true);
  const [ruolo, setRuolo] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
  Alert.alert('Logout', 'Vuoi uscire dall’app?', [
    { text: 'Annulla', style: 'cancel' },
    {
      text: 'Conferma',
      style: 'destructive',
      onPress: async () => {
        await AsyncStorage.multiRemove(['idToken', 'ruolo', 'loggedIn']);
        navigation.replace('Login');
      },
    },
  ]);
};

    useEffect(() => {
    AsyncStorage.getItem('ruolo').then(setRuolo); // 👈 Anche questo
  }, []);

useLayoutEffect(() => {
  navigation.setOptions({
    headerTitle: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 8, color: '#000' }}>
          Consegne
        </Text>
    <Pressable
      onPress={() => navigation.navigate('Calendario')}
      style={{ marginRight: 12 }}
    >
      <Ionicons name="calendar-outline" size={22} color="#66cc66" />
    </Pressable>

    <Pressable onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={22} color="red" />
    </Pressable>
      </View>
    ),
  });
}, [navigation]);



  useEffect(() => {
    const q = query(collection(db, 'consegne'), orderBy('data', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const raccolte = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Consegna[];

      raccolte.sort((a, b) => {
        const da = a.data.toDate();
        const db = b.data.toDate();
        const ha = a.orario || '';
        const hb = b.orario || '';
        return da.getTime() - db.getTime() || ha.localeCompare(hb);
      });

      const raggruppate: { [key: string]: Consegna[] } = {};
      raccolte.forEach((item) => {
        const giornoCorretto = item.data.toDate().toISOString().split('T')[0];
        if (!raggruppate[giornoCorretto]) raggruppate[giornoCorretto] = [];
        raggruppate[giornoCorretto].push(item);
      });

      const trasformate = Object.entries(raggruppate).map(([giorno, consegne]) => ({
        giorno,
        consegne,
      }));
      setGruppi(trasformate);
      setLoading(false);
    });

    return unsub;
  }, []);
  const aggiornaEffettuata = async (id: string, valore: boolean) => {
    try {
      await updateDoc(doc(db, 'consegne', id), { effettuata: valore });
    } catch {
      Alert.alert('Errore', 'Impossibile aggiornare la consegna');
    }
  };

  const eliminaConsegna = (id: string) => {
    Alert.alert(
      'Elimina consegna',
      'Sei sicuro di voler eliminare questa consegna?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'consegne', id));
            } catch {
              Alert.alert('Errore', 'Non è stato possibile eliminare la consegna');
            }
          },
        },
      ]
    );
  };

  const formattaDataCorretta = (ts: Timestamp) => {
    const date = ts.toDate();
    const correggi = date.getUTCHours() === 0 && date.getHours() < 2;
    const d = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + (correggi ? 1 : 0)
    );

    const mesiIT = [
      'gennaio','febbraio','marzo','aprile','maggio','giugno',
      'luglio','agosto','settembre','ottobre','novembre','dicembre',
    ];

    return `${d.getDate()} ${mesiIT[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatQuantita = (q: number) =>
    Math.floor(q).toLocaleString('it-IT', {
      useGrouping: true,
      maximumFractionDigits: 0,
    });

  const renderBox = (item: Consegna) => (
    <View key={item.id} style={styles.box}>
      <View style={styles.rowSpace}>
        <Text style={styles.dest}>{item.destinatario}</Text>
      {ruolo === 'gestore' && (
        <View style={styles.actionRow}>
          <Pressable onPress={() => navigation.navigate('ModificaConsegna', { consegna: item })}>
            <Text style={styles.icona}>✏️</Text>
          </Pressable>
          <Pressable onPress={() => eliminaConsegna(item.id)}>
            <Text style={styles.icona}>🗑️</Text>
          </Pressable>
        </View>
        )}
      </View>

      <Text style={styles.txt}>📍 {item.luogo}</Text>
      <Text style={styles.txt}>🛒 {item.tipoProdotto}</Text>
      <Text style={styles.txt}>🔢 {formatQuantita(item.quantita)}</Text>
      {item.orario ? <Text style={styles.txt}>⏰ {item.orario}</Text> : null}
      {item.note ? <Text style={styles.txt}>💬 {item.note}</Text> : null}
      <View style={styles.switchRow}>
        <Text style={styles.txt}>Effettuata:</Text>
        <Switch
          value={item.effettuata}
          onValueChange={(val) => aggiornaEffettuata(item.id, val)}
          thumbColor={item.effettuata ? '#66cc66' : '#ccc'}
          trackColor={{ false: '#444', true: '#1a6d1a' }}
        />
      </View>
    </View>
  );
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <FlatList
        contentContainerStyle={styles.container}
        data={gruppi}
        keyExtractor={(item) => item.giorno}
        renderItem={({ item }) => (
          <View>
            <View style={styles.rigaData}>
              <Text style={styles.dataTesto}>
                {formattaDataCorretta(item.consegne[0].data)}
              </Text>
            </View>
            {item.consegne.map(renderBox)}
          </View>
        )}
      />
    {/* ✅ Solo i gestori vedono il bottone per aggiungere */}
    {ruolo === 'gestore' && (
      <View style={styles.fixedBtn}>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('NuovaConsegna')}
        >
          <Text style={styles.addText}>+ Aggiungi consegna</Text>
        </Pressable>
      </View>
    )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rigaData: {
    borderBottomWidth: 2,
    borderColor: '#66cc66',
    marginVertical: 12,
    paddingBottom: 4,
  },
  dataTesto: {
    color: '#66cc66',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'capitalize',
  },
  box: {
    backgroundColor: '#000',
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  dest: { fontWeight: 'bold', fontSize: 16, color: '#fff' },
  txt: { color: '#ccc', marginBottom: 2 },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  icona: {
    fontSize: 18,
    color: '#bbb',
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  fixedBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addBtn: {
    backgroundColor: '#66cc66',
    padding: 16,
    alignItems: 'center',
    borderRadius: 6,
  },
  addText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
