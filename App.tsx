import { firebase } from './firebase'; // o dove hai definito firebase
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NuovaConsegnaScreen from './screens/NuovaConsegnaScreen';
import ModificaConsegnaScreen from './screens/ModificaConsegnaScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import FeriePermessiScreen from './screens/FeriePermessiScreen'; // ✅ aggiunto
import './firebase'; // forza inizializzazione
import { setupPushNotifications } from './notifications';
import { useEffect } from 'react';


export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Calendario: undefined;
  NuovaConsegna: undefined;
  FeriePermessi: undefined; // ✅ dichiarato
  ModificaConsegna: { consegna: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    setupPushNotifications(); // ✅ chiamata inserita qui!
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Consegne' }} />
        <Stack.Screen name="NuovaConsegna" component={NuovaConsegnaScreen} options={{ title: 'Nuova Consegna' }} />
        <Stack.Screen name="ModificaConsegna" component={ModificaConsegnaScreen} options={{ title: 'Modifica Consegna' }} />
        <Stack.Screen name="Calendario" component={CalendarioScreen} options={{ title: 'Calendario consegne' }} />
        <Stack.Screen name="FeriePermessi" component={FeriePermessiScreen} options={{ title: 'Ferie & Permessi' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

