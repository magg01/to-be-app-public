import React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import AgendaScreen from './agendaScreen';
import BeScreen from './beScreen';
import colors from '../utils/colors';

const Tab = createMaterialBottomTabNavigator();

function BeScreenIcon({ color }) {
  return <Ionicons name="person-outline" size={24} color={color} />;
}

function AgendaScreenIcon({ color }) {
  return <SimpleLineIcons name="calendar" size={24} color={color} />;
}

function HomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="To be"
      activeColor="#34DDE6"
      inactiveColor="#176266"
      barStyle={styles.tabBarStyle}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="To be"
        component={BeScreen}
        options={{
          tabBarIcon: BeScreenIcon,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={AgendaScreen}
        options={{
          tabBarIcon: AgendaScreenIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: colors.navigation.tabBarBackground,
  },
});

export default HomeScreen;
