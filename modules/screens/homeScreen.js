import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getAllToBeItems } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { ToBeTile } from '../components/toBeTile';

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
    <SafeAreaView style={styles.container}>
      <Text>This is the home screen</Text>
      <Button title={"go to add new screen"} onPress={() => navigation.navigate("AddNewScreen")} />
      {allToBes.map((tobe, index) => (
        <ToBeTile key={index} toBeId={tobe.id} onPress={() => navigation.navigate("ViewToBeScreen", {toBeId: tobe.id})} />
      ))}
      <StatusBar style={"auto"}/>
    </SafeAreaView>
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