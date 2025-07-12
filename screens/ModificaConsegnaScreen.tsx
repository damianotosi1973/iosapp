import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type RouteParams = RouteProp<RootStackParamList, 'ModificaConsegna'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ModificaConsegna'>;

export default function ModificaConsegnaScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<Nav>();
  const consegna = route.params?.consegna;

  const [destinatario, setDestinatario] = useState(consegna.destinatario || '');
  const [tipoProdotto, setTipoProdotto] = useState(consegna.tipoProdotto || '');
  const [quantita, setQuantita] = useState(String(consegna.quantita || ''));
  const [luogo, setLuogo] = useState(consegna.luogo || '');
  const [note, setNote] = useState(consegna.note || '');
  const [data, setData] = useState(
    consegna.data instanceof Timestamp ? consegna.data.toDate() : new Date(consegna.data)
  );
  const [orario, setOrario] = useState<null | Date>(() => {
    if (!consegna.orario) return null;
    const [hh, mm] = consegna.orario.split(':');
    const ora = new Date();
    ora.setHours(Number(hh));
    ora.setMinutes(Number(mm));
    ora.setSeconds(0);
    ora.setMilliseconds(0);
    return ora;
  });

  const [showDataPicker, setShowDataPicker] = useState(false);
  const [showOrarioPicker, setShowOrarioPicker] = useState(false);

  const salva = async () => {
    if (!luogo.trim()) {
      Alert.alert('⚠️ Campo obbligatorio', 'Inserisci il luogo della consegna');
      return;
    }

    try {
      const ref = doc(db, 'consegne', consegna.id);
      await updateDoc(ref, {
        destinatario,
        tipoProdotto,
        quantita: Number(quantita),
        luogo,
        note,
        data,
        orario: orario
          ? orario.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })
          : null,
      });
      Alert.alert('✅ Modifica completata', 'La consegna è stata aggiornata con successo.');
      navigation.goBack();
    } catch (err: any) {
      console.error('❌ Errore aggiornamento:', err);
      Alert.alert('Errore', err?.message ?? 'Impossibile aggiornare la consegna.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Destinatario</Text>
          <TextInput style={styles.input} value={destinatario} onChangeText={setDestinatario} />

          <Text style={styles.label}>Tipo prodotto</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={tipoProdotto} onValueChange={setTipoProdotto}>
              <Picker.Item label="Seleziona..." value="" enabled={false} />
              <Picker.Item label="GASOLIO" value="GASOLIO" />
              <Picker.Item label="HVO" value="HVO" />
              <Picker.Item label="BENZINA" value="BENZINA" />
              <Picker.Item label="Lavaggio" value="Lavaggio" />
              <Picker.Item label="Altro" value="Altro" />
            </Picker>
          </View>

          <Text style={styles.label}>Quantità</Text>
          <TextInput
            style={styles.input}
            value={quantita}
            onChangeText={setQuantita}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Luogo</Text>
          <TextInput style={styles.input} value={luogo} onChangeText={setLuogo} />

          <Text style={styles.label}>Data</Text>
          <Pressable onPress={() => setShowDataPicker(true)} style={styles.input}>
            <Text>{data.toLocaleDateString()}</Text>
          </Pressable>
          {showDataPicker && (
            <DateTimePicker
              value={data}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) setData(selectedDate);
                setShowDataPicker(false);
              }}
            />
          )}

          <Text style={styles.label}>Orario (facoltativo)</Text>
          <Pressable onPress={() => setShowOrarioPicker(true)} style={styles.input}>
            <Text>
              {orario
                ? orario.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : 'Seleziona orario'}
            </Text>
          </Pressable>
          {showOrarioPicker && (
            <DateTimePicker
              value={orario ?? new Date()}
              mode="time"
              display="default"
              is24Hour={true}
              onChange={(_, selectedTime) => {
                if (selectedTime) setOrario(selectedTime);
                setShowOrarioPicker(false);
              }}
            />
          )}

          <Text style={styles.label}>Note (facoltative)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Inserisci eventuali annotazioni"
          />

          <View style={{ marginTop: 24, marginBottom: 80 }}>
            <Button title="💾 Salva modifiche" onPress={salva} color="#28a745" />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 200,
  },
  label: { fontWeight: 'bold', marginBottom: 4, marginTop: 16 },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
  },
});
