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
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FirebaseTestScreen() {
  const [destinatario, setDestinatario] = useState('');
  const [tipoProdotto, setTipoProdotto] = useState('');
  const [quantita, setQuantita] = useState('');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');
  const [data, setData] = useState(new Date());
  const [orario, setOrario] = useState<null | Date>(null);
  const [showDataPicker, setShowDataPicker] = useState(false);
  const [showOrarioPicker, setShowOrarioPicker] = useState(false);

  const salva = async () => {
    try {
      const ref = collection(db, 'testCollezione');
      await addDoc(ref, {
        timestamp: new Date().toISOString(),
        destinatario,
        tipoProdotto,
        quantita,
        luogo,
        note,
        data: data.toISOString(),
        orario: orario
          ? orario.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : null,
        messaggio: 'Test con note!',
      });
      Alert.alert('✅ Successo', 'Dati salvati con successo!');
    } catch (error: any) {
      const msg = error?.message ?? JSON.stringify(error);
      Alert.alert('Errore Firebase', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Destinatario</Text>
          <TextInput style={styles.input} value={destinatario} onChangeText={setDestinatario} />

          <Text style={styles.label}>Tipo prodotto</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoProdotto}
              onValueChange={(itemValue) => setTipoProdotto(itemValue)}
            >
              <Picker.Item label="Seleziona..." value="" enabled={false} />
              <Picker.Item label="GASOLIO" value="GASOLIO" />
              <Picker.Item label="HVO" value="HVO" />
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
            <Button title="🔥 Salva tutto" onPress={salva} color="#007BFF" />
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
