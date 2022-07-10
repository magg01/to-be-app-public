import React, { useState } from 'react';
import { StyleSheet, ImageBackground, TextInput, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const backgroundImage = require("../../assets/addNew.jpg");

const AddNewScreen = () => {
  const [titleText, updateTitleText] = useState('');

  return (
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
          <TextInput style={styles.input} onChangeText={updateTitleText} value={titleText} />
          <Button title="Save" onPress={() => Alert.alert('save it here')} />
          <StatusBar style="auto" />
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

export { AddNewScreen }