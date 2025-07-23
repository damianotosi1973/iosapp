import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

type Evento = {
  id: string;
  nome: string;
  tipo: string;
  motivo?: string;
  dal?: Date;
  al?: Date;
  giorno?: Date;
  ore?: number;
};

type Utente = {
  nome: string;
  ruolo: string;
};

const coloriOperai: Record<string, string> = {
  Malick: 'green',
  Luca: 'lightblue',
  Osvaldo: 'purple',
  Rahim: 'teal',
  Bruno: 'gold',
  Vito: 'red',
  Militello: 'orange',
  Dario: 'darkorange',
  Martina: 'blue',
  Eva: 'pink',
  Annalisa: 'cyan',
  Matteo: 'indigo',
  Alessio: 'lime',
  Francesco: 'white',
};

export default function FeriePermessiScreen() {
  const navigation = useNavigation();
  const [eventi, setEventi] = useState<Record<string, Evento[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString('sv-SE')
  );
  const [utente, setUtente] = useState<Utente | null>(null);
  const isGestore = utente?.ruolo === 'gestore' || utente?.ruolo === 'amministratore';

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'eventi_lavoratori'), (snapshot) => {
      const nuoviEventi: Record<string, Evento[]> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const e: Evento = {
          id: doc.id,
          nome: data.nome || '',
          tipo: (data.tipo || '').toLowerCase(),
          motivo: data.motivo || '',
          ore: typeof data.ore === 'number' ? data.ore : undefined,
          dal: parseData(data.dal),
          al: parseData(data.al),
          giorno: parseData(data.giorno),
        };
        nuoviEventi[e.nome] = nuoviEventi[e.nome] || [];
        nuoviEventi[e.nome].push(e);
      });

      setEventi(nuoviEventi);
    });

    return () => unsubscribe();
  }, []);

  function parseData(val: any): Date | undefined {
    if (val?.toDate) return val.toDate();
    if (typeof val === 'string') {
      const d = new Date(val);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    return undefined;
  }

  function generaMarcatori() {
    const marks: Record<string, { dots: { key: string; color: string }[] }> = {};

    Object.keys(eventi).forEach((nome) => {
      const colore = coloriOperai[nome] || 'gray';
      eventi[nome].forEach((e) => {
        if (e.tipo === 'ferie' && e.dal && e.al) {
          const dal = new Date(e.dal);
          const fineAssenza = new Date(e.al);
          fineAssenza.setDate(fineAssenza.getDate() - 1); // ❗ escludi giorno di rientro

          const current = new Date(dal);
          while (current <= fineAssenza) {
            const key = current.toLocaleDateString('sv-SE');
            marks[key] = marks[key] || { dots: [] };
            marks[key].dots.push({ key: nome, color: colore });
            current.setDate(current.getDate() + 1);
          }
        } else if (e.tipo === 'permesso' && e.giorno) {
          const key = e.giorno.toLocaleDateString('sv-SE');
          marks[key] = marks[key] || { dots: [] };
          marks[key].dots.push({ key: nome, color: colore });
        }
      });
    });

    return marks;
  }

  const marcatori = generaMarcatori();
  function eventiDelGiorno(): Evento[] {
    const selezionati: Evento[] = [];
    Object.keys(eventi).forEach((nome) => {
      eventi[nome].forEach((e) => {
        if (e.tipo === 'ferie' && e.dal && e.al) {
          const giorno = new Date(selectedDate);
          if (giorno >= e.dal && giorno < e.al) selezionati.push(e); // ❗ notare "< e.al" = escluso rientro
        } else if (e.tipo === 'permesso' && e.giorno) {
          const giornoStr = e.giorno.toLocaleDateString('sv-SE');
          if (giornoStr === selectedDate) selezionati.push(e);
        }
      });
    });

    return selezionati;
  }

  function formatData(data: Date) {
    return data.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function confermaEliminazione(idEvento: string) {
    Alert.alert('Elimina evento', 'Vuoi davvero eliminarlo?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          // deleteDoc(doc(db, 'eventi_lavoratori', idEvento)) // da attivare
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={styles.container}>
        <Text style={styles.titolo}>Calendario Ferie & Permessi</Text>

        <Calendar
          markingType="multi-dot"
          onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
          markedDates={marcatori}
          theme={{
            calendarBackground: '#000',
            dayTextColor: '#fff',
            monthTextColor: '#fff',
            arrowColor: '#fff',
            selectedDayBackgroundColor: '#1E88E5',
            todayTextColor: '#FFA726',
          }}
        />

        <FlatList
          style={styles.legenda}
          data={Object.entries(coloriOperai)}
          keyExtractor={([nome], index) => nome + '-' + index}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={[styles.chip, { backgroundColor: item[1] }]}>
              <Text style={styles.chipText}>{item[0]}</Text>
            </View>
          )}
        />

        <Text style={styles.subTitle}>Eventi del {formatData(new Date(selectedDate))}</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {eventiDelGiorno().length === 0 ? (
            <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 20 }}>
              🕊️ Nessun evento per questo giorno
            </Text>
          ) : (
            eventiDelGiorno().map((e) => {
              const colore = coloriOperai[e.nome] || 'gray';
              const tipo = e.tipo;
              const titolo =
                tipo === 'ferie'
                  ? `Ferie dal ${formatData(e.dal!)} al ${formatData(e.al!)}`
                  : `Permesso ${formatData(e.giorno!)} (${e.ore}h)`;
              return (
                <View key={e.id} style={styles.eventoBox}>
                  <Ionicons
                    name={tipo === 'ferie' ? 'umbrella' : 'time'}
                    size={20}
                    color={colore}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white' }}>{e.nome} — {titolo}</Text>
                    <Text style={{ color: 'white', fontSize: 12 }}>Motivo: {e.motivo}</Text>
                  </View>
                  {isGestore && (
                    <View style={styles.buttons}>
                      <TouchableOpacity>
                        <Ionicons name="pencil" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confermaEliminazione(e.id)}>
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  titolo: { fontSize: 20, color: '#FFA726', marginBottom: 8 },
  legenda: { marginVertical: 8 },
  chip: { padding: 6, borderRadius: 12, margin: 4 },
  chipText: { color: '#000', fontSize: 12 },
  subTitle: { color: 'orange', fontSize: 16, marginVertical: 4 },
  eventoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  buttons: { flexDirection: 'row', gap: 12, marginLeft: 8 },
});
