import React from 'react';
import { StyleSheet, Text, SafeAreaView, ImageBackground, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 

export default ViewToBeScreen = ({route}) => {
  const title = route.params.title
  const imageBackgroundUri = route.params.imageBackgroundUri

  return(
    <ImageBackground source={{uri: imageBackgroundUri}} resizeMode="cover" style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={{color: 'white', fontSize: 36}}>{title}</Text>
        <Button title={"next"}/>
        <Button title={"previous"}/>
      </SafeAreaView>
      <StatusBar style={'auto'} />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});