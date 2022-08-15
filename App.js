import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setNotificationHandler } from 'expo-notifications';
import HomeScreen from './modules/screens/homeScreen';
import ViewToBeScreen from './modules/screens/viewToBeScreen';
import { fetchPermissionSettings, checkPermissionSettings } from './modules/utils/notifications';

const Stack = createStackNavigator();

// Sets the handler function responsible for deciding
// what to do with a notification that is received when the app is in foreground
setNotificationHandler({
  handleNotification: async () => {
    const permissionSettings = fetchPermissionSettings();
    if (Platform.OS === 'ios'){
      return {
        shouldShowAlert: permissionSettings.ios?.allowsAlert,
        shouldPlaySound: permissionSettings.ios?.allowsSound,
        shouldSetBadge: false,
        shouldShowAnnouncement: permissionSettings.ios?.allowsAnnouncements,
      }
    } else {
      if (checkPermissionSettings(permissionSettings) === 'granted'){
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowAnnouncement: true,
        }
      }
    }
  }
})

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="HomeScreen" 
        screenOptions={{
          headerTintColor: 'white',
          headerTransparent: true,
          title: ""
        }}
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="ViewToBeScreen" component={ViewToBeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
