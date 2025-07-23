import { Timestamp } from 'firebase/firestore';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  NuovaConsegna: undefined;
  Calendario: undefined;
  FeriePermessi: undefined; // ✅ aggiunto
  ModificaConsegna: {
    consegna: {
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
  };
};