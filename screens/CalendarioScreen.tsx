import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  Button,
  ScrollView,
} from 'react-native';
import { format, addDays } from 'date-fns';
import { firestore } from '../firebase';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type Consegna = {
  id: string;
  tipoProdotto: string;
  destinatario: string;
  luogo: string;
  quantita: number;
  orario?: string;
  note?: string;
  effettuata: boolean;
  data: FirebaseFirestoreTypes.Timestamp;
};

const generaGiorni = (numGiorni: number): string[] => {
  const giorni: string[] = [];
  for (let i = 0; i < numGiorni; i++) {
    giorni.push(format(addDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return giorni;
};

const CalendarioScreen = () => {
  const [dataSelezionata, setDataSelezionata] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [consegne, setConsegne] = useState<Consegna[]>([]);
  const [dettaglio, setDettaglio] = useState<Consegna | null>(null);

  const giorni = generaGiorni(10);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('consegne')
      .orderBy('data', 'asc')
      .onSnapshot((snap) => {
        const raccolte = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Consegna[];

        setConsegne(raccolte);
      });

    return unsubscribe;
  }, []);

  const consegneDelGiorno = consegne.filter((c) => {
    const giorno = c.data.toDate();
    const giornoStr = format(giorno, 'yyyy-MM-dd');
    return giornoStr === dataSelezionata;
  });

  const contaConsegnePerGiorno = (giorno: string) =>
    consegne.filter((c) => format(c.data.toDate(), 'yyyy-MM-dd') === giorno).length;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {giorni.map((giorno) => {
          const isSelected = giorno === dataSelezionata;
          const count = contaConsegnePerGiorno(giorno);

          return (
            <Pressable
              key={giorno}
              onPress={() => setDataSelezionata(giorno)}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
              ]}
            >
              <Text
                style={isSelected ? styles.dayTextSelected : styles.dayText}
              >
                {format(new Date(giorno), 'dd MMM')}
              </Text>
              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.titolo}>
        Consegne per il {format(new Date(dataSelezionata), 'dd MMM yyyy')}
      </Text>

      <FlatList
        data={consegneDelGiorno}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => setDettaglio(item)}>
            <View style={styles.item}>
              <Text style={styles.titolo}>{item.tipoProdotto}</Text>
              <Text>{item.destinatario}</Text>
              <Text>{item.luogo}</Text>
              <Text>{item.quantita} pezzi</Text>
              {item.orario && <Text>⏰ {item.orario}</Text>}
              {item.note && <Text>💬 {item.note}</Text>}
              <Text>
                {item.effettuata ? '✅ Effettuata' : '🕒 Da effettuare'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nessuna consegna per questo giorno.</Text>
        }
      />

      <Modal
        visible={!!dettaglio}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDettaglio(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {dettaglio && (
              <>
                <Text style={styles.titolo}>{dettaglio.tipoProdotto}</Text>
                <Text>{dettaglio.destinatario}</Text>
                <Text>{dettaglio.luogo}</Text>
                <Text>{dettaglio.quantita} pezzi</Text>
                {dettaglio.orario && <Text>⏰ {dettaglio.orario}</Text>}
                {dettaglio.note && <Text>💬 {dettaglio.note}</Text>}
                <Text>
                  {dettaglio.effettuata
                    ? '✅ Effettuata'
                    : '🕒 Da effettuare'}
                </Text>
              </>
            )}
            <Button title="Chiudi" onPress={() => setDettaglio(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  titolo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },
  item: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  dayButtonSelected: {
    backgroundColor: '#00adf5',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default CalendarioScreen;