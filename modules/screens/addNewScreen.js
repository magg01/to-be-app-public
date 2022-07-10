import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ImageBackground, TextInput, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const backgroundImage = require("../../assets/addNew.jpg");

const AddNewScreen = () => {
  const [titleText, updateTitleText] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  return (
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <TextInput
            style={styles.input} 
            onChangeText={updateTitleText}
            value={titleText} 
            textAlign={'center'}
            autoFocus={true}
            showSoftInputOnFocus={true}
            selectionColor={'white'}
          />
          {showImagePicker ? <UnsplashImagePicker></UnsplashImagePicker> : null}
          {showSaveButton ? <Button title="Save" onPress={() => Alert.alert('save it here')} /> : null}
          <StatusBar style="auto" />
        </SafeAreaView>
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    input: {
      width: "50%",
      margin: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'white',
      padding: 6,
      fontSize: 30,
      color: 'white'
    },
  });

export { AddNewScreen }