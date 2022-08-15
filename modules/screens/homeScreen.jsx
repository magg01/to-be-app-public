import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SimpleLineIcons, Ionicons  } from '@expo/vector-icons'; 
import { AgendaScreen } from './agendaScreen';
import AddNewScreen from './addNewScreen';
import { BeScreen } from './beScreen';

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Be"
      activeColor="#f0edf6"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: 'rgba(105, 79, 173, 1)' }}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="AddNew"
        component={AddNewScreen}
        options={{
          tabBarLabel: 'New',
          tabBarIcon: ({ color }) => {
            return (
              <Ionicons name="add-circle-outline" size={24} color={color} />
            )
          },
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Be"
        component={BeScreen}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <Ionicons name="person-outline" size={24} color={color} />
            )
          }
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={AgendaScreen}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <SimpleLineIcons name="calendar" size={24} color={color} />
            )
          }
        }}
      />
    </Tab.Navigator>
  );
}

export default HomeScreen;
