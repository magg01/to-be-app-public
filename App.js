import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { setNotificationHandler } from 'expo-notifications';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import ViewToBeScreen from './modules/screens/viewToBeScreen';
import AgendaScreen from './modules/screens/agendaScreen';
import { fetchPermissionSettings, checkPermissionSettings } from './modules/utils/notifications';
import AddNewScreen from './modules/screens/addNewScreen';
import BeScreen from './modules/screens/beScreen';

const Tab = createMaterialBottomTabNavigator();
const BeStack = createStackNavigator();
const AddNewStack = createStackNavigator();

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

function BeStackScreen() {
  return (
    <BeStack.Navigator 
      screenOptions={{
        headerTintColor: 'white',
        headerTransparent: true,
        title: '',
      }}
    >
      <BeStack.Screen name="BeScreen" component={BeScreen} />
      <BeStack.Screen name="ViewToBeScreen" component={ViewToBeScreen} />
    </BeStack.Navigator>
  );
}

function AddNewStackScreen() {
  return (
    <AddNewStack.Navigator
      screenOptions={{
        headerTintColor: 'white',
        headerTransparent: true,
        title: '',
      }}
    >
      <AddNewStack.Screen name="AddNewScreen" component={AddNewScreen} />
    </AddNewStack.Navigator>
  );
}

export default function App() {
  return (
    // <NavigationContainer>
    //   <Stack.Navigator
    //     initialRouteName="HomeScreen"
    //     screenOptions={{
    //       headerTintColor: 'white',
    //       headerTransparent: true,
    //       title: ""
    //     }}
    //   >
    //     <Stack.Screen name="HomeScreen" component={HomeScreen}/>
    //     <Stack.Screen name="ViewToBeScreen" component={ViewToBeScreen} />
    //   </Stack.Navigator>
    // </NavigationContainer>
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Be"
        activeColor="#f0edf6"
        inactiveColor="#3e2465"
        barStyle={{ backgroundColor: 'rgba(105, 79, 173, 1)' }}
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="AddNew"
          component={AddNewStackScreen}
          options={{
            tabBarLabel: 'New',
            tabBarIcon: ({ color }) => (
              <Ionicons name="add-circle-outline" size={24} color={color} />
            ),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Be"
          component={BeStackScreen}
          options={{
            tabBarIcon: ({color}) => (
              <Ionicons name="person-outline" size={24} color={color} />
            )
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={AgendaScreen}
          options={{
            tabBarIcon: ({color}) => (
              <SimpleLineIcons name="calendar" size={24} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
