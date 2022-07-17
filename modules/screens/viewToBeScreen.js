import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 

export default ViewToBeScreen = (props) => {
  return(
    <View style={styles.container}>
      <Text>This is the view to be screen</Text> 
      <StatusBar style={'auto'} />
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