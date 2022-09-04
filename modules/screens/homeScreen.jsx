/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
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
  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colors.navigation.tabBarBackground);
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []));

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
