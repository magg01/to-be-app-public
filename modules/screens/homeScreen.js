import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { AgendaScreen } from './agendaScreen';
import { AddNewScreen } from './addNewScreen';
import { BeScreen } from './beScreen';

const Tab = createMaterialBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator 
      initialRouteName='Be'
      activeColor="#f0edf6"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: '#694fad' }}
    >
      <Tab.Screen 
        name="AddNew" 
        component={AddNewScreen} 
      />
      <Tab.Screen 
        name="Be" 
        component={BeScreen} 
      />
      <Tab.Screen 
        name="Calendar" 
        component={AgendaScreen} 
      />
    </Tab.Navigator>
  )  
}

export { HomeScreen }