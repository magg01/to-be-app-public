import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AddNewScreen } from './modules/screens/addNewScreen';
import { HomeScreen } from './modules/screens/homeScreen';
import ViewToBeScreen from './modules/screens/viewToBeScreen';
import { AgendaScreen } from './modules/screens/agendaScreen';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';


const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    }
  }
})

export default function App() {

  //permissions module is deprecated so adjust this
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
    .then((statusObj) => {
      if (statusObj.status !== 'granted') {
        return Permissions.askAsync(Permissions.NOTIFICATIONS)
      }
      return statusObj;
    })
    .then((statusObj) => {
      if (statusObj.status !== 'granted') {
        return;
      }
    })
  }, [])

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
