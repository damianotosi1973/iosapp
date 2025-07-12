import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NuovaConsegnaScreen from './screens/NuovaConsegnaScreen';
import ModificaConsegnaScreen from './screens/ModificaConsegnaScreen';
import CalendarioScreen from './screens/CalendarioScreen';


export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Calendario: undefined;
  NuovaConsegna: undefined;
  ModificaConsegna: { consegna: any }; // Tipizza meglio se hai i tipi precisi
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Consegne' }} />
        <Stack.Screen name="NuovaConsegna" component={NuovaConsegnaScreen} options={{ title: 'Nuova Consegna' }} />
        <Stack.Screen name="ModificaConsegna" component={ModificaConsegnaScreen} options={{ title: 'Modifica Consegna' }} />
        <Stack.Screen name="Calendario" component={CalendarioScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
