import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import AgendaScreen from './agendaScreen';
import BeScreen from './beScreen';

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="To be"
      activeColor="#34DDE6"
      inactiveColor="#176266"
      barStyle={{ backgroundColor: '#321F71' }}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="To be"
        component={BeScreen}
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
  );
}

export default HomeScreen;
