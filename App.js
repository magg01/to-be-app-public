import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AddNewScreen } from './modules/screens/addNewScreen';
import { HomeScreen } from './modules/screens/homeScreen';
import ViewToBeScreen from './modules/screens/viewToBeScreen';
import { AgendaScreen } from './modules/screens/agendaScreen';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{headerShown: false}}>
        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="AddNewScreen" component={AddNewScreen}/>
        <Stack.Screen name="ViewToBeScreen" component={ViewToBeScreen} />
        <Stack.Screen name="AgendaScreen" component={AgendaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
