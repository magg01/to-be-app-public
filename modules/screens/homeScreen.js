import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>This is the home screen</Text>
      <Button title={"go to add new screen"} onPress={() => navigation.navigate("AddNewScreen")} />
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