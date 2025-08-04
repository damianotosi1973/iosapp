// src/services/notifications.ts

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Alert, Platform } from 'react-native';

export const setupPushNotifications = async () => {
  try {
    // 🔐 Richiesta permessi (solo iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Alert.alert('Permessi notifiche non concessi');
      return;
    }

    // 📡 Ottieni token
    const token = await messaging().getToken();
    console.log('📲 Token FCM:', token);

    // 💾 Salva su Firestore
    if (token && token.length > 100) {
      await firestore().collection('tokens').add({ token });
    }

    // 📥 Gestione foreground
    messaging().onMessage(async remoteMessage => {
      console.log('📩 Notifica in foreground:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || 'Notifica',
        remoteMessage.notification?.body || ''
      );
    });

    // 📤 Gestione background/app chiusa (solo Android)
    if (Platform.OS === 'android') {
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📩 Notifica in background (Android):', remoteMessage);
      });
    }

    // 📲 App aperta da notifica (background → foreground)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 App aperta da notifica:', remoteMessage);
      // Puoi navigare o aggiornare lo stato qui
    });

    // 🚀 App avviata da notifica (cold start)
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('🚀 App avviata da notifica:', initialNotification);
      // Puoi gestire la navigazione iniziale qui
    }
  } catch (error) {
    console.error('💥 Errore setupPushNotifications:', error);
  }
};