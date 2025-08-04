// firestore.ts

import { firestore } from './firebase';

// 🔗 Riferimenti alle collezioni
export const consegneRef = firestore().collection('consegne');
export const usersRef = firestore().collection('users');
export const tokensRef = firestore().collection('tokens');
export const eventiLavoratoriRef = firestore().collection('eventi_lavoratori');

// 🔍 Query comuni
export const utentiAttiviQuery = usersRef.where('attivo', '==', true);
export const consegneCompletateQuery = consegneRef.where('stato', '==', 'completata');
export const eventiPerLavoratore = (lavoratoreId: string) =>
  eventiLavoratoriRef.where('lavoratoreId', '==', lavoratoreId);
export const tokenPerUtente = (userId: string) =>
  tokensRef.where('userId', '==', userId);

// 🛠️ Funzioni helper
export const getUtentiAttivi = async () => {
  const snapshot = await utentiAttiviQuery.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getConsegneCompletate = async () => {
  const snapshot = await consegneCompletateQuery.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEventiLavoratore = async (lavoratoreId: string) => {
  const snapshot = await eventiPerLavoratore(lavoratoreId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTokenUtente = async (userId: string) => {
  const snapshot = await tokenPerUtente(userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};