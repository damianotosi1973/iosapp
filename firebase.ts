//firebase.ts

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// ✅ Istanza Firestore da usare come 'db'
export const db = firestore();

// ✅ Esporta istanze native
export { firebase, auth, firestore, messaging };