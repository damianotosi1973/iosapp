import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CalendarioScreen() {
  const [consegne, setConsegne] = useState<Consegna[]>([]);
  const [giorni, setGiorni] = useState<Date[]>([]);
  const [selezionato, setSelezionato] = useState<Date | null>(null);
  const [espansa, setEspansa] = useState<string | null>(null);

  useEffect(() => {
    const oggi = new Date();
    const prossimi7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(oggi);
      d.setDate(d.getDate() + i);
      return d;
    });
    setGiorni(prossimi7);
    setSelezionato(prossimi7[0]);

    const q = query(collection(db, 'consegne'), orderBy('data', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Consegna[];
      setConsegne(docs);
    });

    return unsub;
  }, []);

  const stesseDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const filtered = consegne.filter((c) => {
    const dt = c.data.toDate();
    return selezionato ? stesseDate(dt, selezionato) : false;
  });

  const haConsegneIn = (giorno: Date) =>
    consegne.some((c) => stesseDate(c.data.toDate(), giorno));

  const nomeGiorno = (d: Date) =>
    d.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase();

  const giornoNumero = (d: Date) => d.getDate();

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.header}>
        {giorni.map((g) => {
          const selez = selezionato && stesseDate(g, selezionato);
          return (
            <Pressable key={g.toISOString()} onPress={() => setSelezionato(g)} style={[styles.giorno, selez && styles.giornoSelezionato]}>
              <Text style={styles.giornoNome}>{nomeGiorno(g)}</Text>
              <Text style={styles.giornoNumero}>{giornoNumero(g)}</Text>
              {haConsegneIn(g) && <View style={styles.pallino} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        contentContainerStyle={styles.lista}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vuoto}>Nessuna consegna per questo giorno.</Text>}
        renderItem={({ item }) => {
          const isOpen = espansa === item.id;
          return (
            <Pressable
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                setEspansa((e) => (e === item.id ? null : item.id));
              }}
              style={styles.card}
            >
              <View style={styles.headerCard}>
                <Text style={styles.dest}>{item.destinatario}</Text>
                <Text style={styles.prod}>{item.tipoProdotto}</Text>
              </View>
              {isOpen && (
                <View style={styles.dettagli}>
                  <Text style={styles.txt}>📍 {item.luogo}</Text>
                  <Text style={styles.txt}>🔢 {item.quantita}</Text>
                  {item.orario ? <Text style={styles.txt}>⏰ {item.orario}</Text> : null}
                  {item.note ? <Text style={styles.txt}>💬 {item.note}</Text> : null}
                  <Text style={styles.txt}>✔️ {item.effettuata ? 'Effettuata' : 'Da fare'}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  giorno: {
    width: 60,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  giornoSelezionato: {
    backgroundColor: '#66cc66',
  },
  giornoNome: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  giornoNumero: {
    fontSize: 18,
    color: '#222',
  },
  pallino: {
    width: 8,
    height: 8,
    backgroundColor: 'green',
    borderRadius: 4,
    marginTop: 4,
  },
  lista: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dest: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  prod: { fontSize: 14, color: '#666' },
  dettagli: {
    marginTop: 8,
  },
  txt: { color: '#444', marginBottom: 4 },
  vuoto: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
