import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setNotificationHandler } from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { setUpDatabase, setUpTables } from './modules/database/database';
import HomeScreen from './modules/screens/homeScreen';
import ViewToBeScreen from './modules/screens/viewToBeScreen';
import { fetchPermissionSettings, checkPermissionSettings } from './modules/utils/notifications';
import AddNewScreen from './modules/screens/addNewScreen';
import CONSTANT_STRINGS from './modules/strings/constantStrings';

const Stack = createStackNavigator();

// Sets the handler function responsible for deciding
// what to do with a notification that is received when the app is in foreground
setNotificationHandler({
  handleNotification: async () => {
    const permissionSettings = await fetchPermissionSettings();
    if (Platform.OS === 'ios') {
      return {
        shouldShowAlert: permissionSettings.ios?.allowsAlert,
        shouldPlaySound: permissionSettings.ios?.allowsSound,
        shouldSetBadge: false,
        shouldShowAnnouncement: permissionSettings.ios?.allowsAnnouncements,
      };
    }
    if (checkPermissionSettings(permissionSettings) === 'granted') {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowAnnouncement: true,
      };
    }
  },
});

// solution for setting title header in nested navigators from the docs
// see: https://reactnavigation.org/docs/screen-options-resolution/
function getHeaderTitle(route) {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen if there hasn't been any navigation inside the screen
  // In our case, it's "To be" as that's the first screen inside the navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'To be';
  let headerTitle;
  switch (routeName) {
    case 'To be':
      headerTitle = CONSTANT_STRINGS.BE_SCREEN.HEADER_TITLE;
  }
  return headerTitle;
}

setUpDatabase();
setUpTables();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="HomeScreen" 
        screenOptions={{
          headerTintColor: 'white',
          headerTransparent: true,
          headerTitleAlign: 'center',
          title: "",
          headerTitleStyle: {
            fontSize: 26,
          }
        }}
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={({route}) => ({
          headerTitle: getHeaderTitle(route),
        })} />
        <Stack.Screen name="ViewToBeScreen" component={ViewToBeScreen} />
        <Stack.Screen name="AddNewScreen" component={AddNewScreen} />
      </Stack.Navigator>
      <Toast
        position='bottom'
        bottomOffset={20}
        visibilityTime={2000}
      />
    </NavigationContainer>
  );
}
