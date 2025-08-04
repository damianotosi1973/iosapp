import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';

type Evento = {
  id: string;
  nome: string;
  tipo: string;
  motivo?: string;
  dal?: Date | null;
  al?: Date | null;
  giorno?: Date | null;
  ore?: number;
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
  Francesco: 'black',
};

const mesiBrevi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

const parseData = (val: any): Date | null => {
  if (!val) return null;

  if (typeof val === 'string') {
    const parts = val.split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  if (val.toDate) {
    const d = val.toDate();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return null;
};

const formattaData = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formattaDataBreve = (date: Date): string => {
  const giorno = date.getDate();
  const mese = mesiBrevi[date.getMonth()];
  return `${giorno} ${mese}`;
};

const FeriePermessiScreen = () => {
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [selezionato, setSelezionato] = useState<string>('');
  const [calendarDots, setCalendarDots] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('eventi_lavoratori')
      .onSnapshot(snapshot => {
        const nuoviEventi: Evento[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const evento: Evento = {
            id: doc.id,
            nome: data.nome,
            tipo: data.tipo,
            motivo: data.motivo,
            dal: parseData(data.dal),
            al: parseData(data.al),
            giorno: parseData(data.giorno),
            ore: data.ore,
          };
          nuoviEventi.push(evento);
        });
        setEventi(nuoviEventi);
        generaPallini(nuoviEventi);
      });

    return () => unsubscribe();
  }, []);

  const generaPallini = (eventi: Evento[]) => {
    const dots: Record<string, any> = {};

    eventi.forEach(ev => {
      const colore = coloriOperai[ev.nome] || 'gray';
      const dateList: string[] = [];

      if (ev.giorno) {
        dateList.push(formattaData(ev.giorno));
      } else if (ev.dal && ev.al) {
        const current = new Date(ev.dal);
        const fine = new Date(ev.al);
        fine.setDate(fine.getDate() - 1);

        while (current <= fine) {
          dateList.push(formattaData(current));
          current.setDate(current.getDate() + 1);
        }
      }

      dateList.forEach(date => {
        if (!dots[date]) dots[date] = { dots: [] };
        dots[date].dots.push({ key: ev.id, color: colore });
      });
    });

    setCalendarDots(dots);
  };

  const eventiDelGiorno = eventi.filter(ev => {
    if (!selezionato) return false;

    const giornoSelezionato = formattaData(new Date(selezionato));

    if (ev.giorno) {
      return formattaData(ev.giorno) === giornoSelezionato;
    }

    if (ev.dal && ev.al) {
      const dal = formattaData(ev.dal);
      const giornoRientro = new Date(ev.al);
      giornoRientro.setDate(giornoRientro.getDate() - 1);
      const ultimoGiornoFerie = formattaData(giornoRientro);

      return giornoSelezionato >= dal && giornoSelezionato <= ultimoGiornoFerie;
    }

    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={{
          ...calendarDots,
          [selezionato]: {
            ...(calendarDots[selezionato] || {}),
            selected: true,
            selectedColor: '#ccc',
          },
        }}
        onDayPress={day => setSelezionato(day.dateString)}
      />

      <Text style={styles.titolo}>Eventi del {selezionato}</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {eventiDelGiorno.map(ev => (
          <View key={ev.id} style={styles.eventoBox}>
            <Text style={{ color: coloriOperai[ev.nome] || 'gray', fontWeight: 'bold' }}>
              {ev.nome}
            </Text>
            <Text>{ev.tipo} {ev.motivo ? `- ${ev.motivo}` : ''}</Text>

            {ev.tipo === 'ferie' && ev.dal && ev.al && (
              <Text>
                Dal: {formattaDataBreve(ev.dal)} — Al: {formattaDataBreve(ev.al)}
              </Text>
            )}

            {ev.tipo === 'permesso' && ev.ore && (
              <Text>Ore: {ev.ore}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  titolo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  eventoBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});

export default FeriePermessiScreen;