import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBK32o_Egk41DEh3_bFJAvDUhCWdlJYLlU",
  authDomain: "appconsegne-e7a49.firebaseapp.com",
  projectId: "appconsegne-e7a49",
  storageBucket: "appconsegne-e7a49.firebasestorage.app",
  messagingSenderId: "506764052646",
  appId: "1:506764052646:web:2d0c0ff23e5db7bb73cc67"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
