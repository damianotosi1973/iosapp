import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
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
  const [dettaglio, setDettaglio] = useState<Consegna | null>(null);

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

  const toMinuti = (ora?: string) => {
    if (!ora) return Infinity;
    const [h, m] = ora.split(':').map(Number);
    return h * 60 + m;
  };

  const filtered = consegne
    .filter((c) => {
      const dt = c.data.toDate();
      return selezionato ? stesseDate(dt, selezionato) : false;
    })
    .sort((a, b) => toMinuti(a.orario) - toMinuti(b.orario));

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
            <Pressable
              key={g.toISOString()}
              onPress={() => setSelezionato(g)}
              style={[styles.giorno, selez && styles.giornoSelezionato]}
            >
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
        ListEmptyComponent={
          <Text style={styles.vuoto}>Nessuna consegna per questo giorno.</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setDettaglio(item)} style={styles.card}>
            <View style={styles.riga}>
              <Text style={styles.prodotto}>{item.tipoProdotto}</Text>
              <Text style={styles.destinatario}>{item.destinatario}</Text>
            </View>
            <View style={styles.riga}>
              <Text style={styles.luogo}>📍 {item.luogo}</Text>
              <Text style={styles.quantita}>Quantità: {item.quantita}</Text>
            </View>
            {item.orario && <Text style={styles.orario}>⏰ {item.orario}</Text>}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.flag,
                  { color: item.effettuata ? 'green' : 'orange' },
                ]}
              >
                {item.effettuata ? '✔️ Effettuata' : '⏳ Da fare'}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {dettaglio && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitolo}>📦 Dettaglio Consegna</Text>
            <Text style={styles.txt}>🛒 Prodotto: {dettaglio.tipoProdotto}</Text>
            <Text style={styles.txt}>👤 Destinatario: {dettaglio.destinatario}</Text>
            <Text style={styles.txt}>📍 Luogo: {dettaglio.luogo}</Text>
            <Text style={styles.txt}>Quantità: {dettaglio.quantita}</Text>
            {dettaglio.orario && (
              <Text style={styles.txt}>⏰ Orario: {dettaglio.orario}</Text>
            )}
            {dettaglio.note && (
              <Text style={styles.txt}>💬 Note: {dettaglio.note}</Text>
            )}
            <Text
              style={[
                styles.txt,
                {
                  color: dettaglio.effettuata ? 'green' : 'orange',
                  fontWeight: 'bold',
                },
              ]}
            >
              {dettaglio.effettuata ? '✔️ Effettuata' : '⏳ Da fare'}
            </Text>
            <Pressable onPress={() => setDettaglio(null)} style={styles.chiudiBtn}>
              <Text style={{ color: '#fff' }}>Chiudi</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  riga: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  prodotto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  destinatario: {
    fontSize: 16,
    color: '#555',
  },
  luogo: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  quantita: {
    fontSize: 14,
    color: '#444',
    textAlign: 'right',
    minWidth: 80,
  },
  orario: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  flag: {
    fontWeight: '600',
    fontSize: 14,
  },
  vuoto: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontStyle: 'italic',
  },
  txt: {
    color: '#444',
    marginBottom: 4,
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitolo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chiudiBtn: {
    marginTop: 20,
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
