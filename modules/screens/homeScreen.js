import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAllToBeItems } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  const [allToBes, setAllToBes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const toBes = await getAllToBeItems();
        setAllToBes(toBes)
      })();
      //have to make sure we have empty dependency array here otherwise the effect runs on every render
      //because arrays are compared by reference and even if the array contents haven't changed the
      //array will appear to have changed because it's a different reference
    }, [])    
  )

  return (
    <View style={styles.container}>
      <Text>This is the home screen</Text>
      <Button title={"go to add new screen"} onPress={() => navigation.navigate("AddNewScreen")} />
      <Button title={"go to view screen"} onPress={() => navigation.navigate("ViewToBeScreen")} />
      {allToBes.map((tobe, index) => (
        <Text key={index}>{tobe.title}</Text>
      ))}
      <StatusBar style={"auto"}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { HomeScreen }