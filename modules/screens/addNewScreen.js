import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ImageBackground, TextInput, Button, Alert, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnsplashImageSearch from './unsplashImageSearch';

const backgroundImage = require("../../assets/addNew.jpg");
const {height, width} = Dimensions.get('window');

const AddNewScreen = () => {
  const [titleText, updateTitleText] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [ImageBackgroundUri, setImageBackgroundUri] = useState(backgroundImage);

  const updateImageBackground = (uri) => {
    setImageBackgroundUri({uri: uri});
    setShowImagePicker(false);
  }

  return (
      <ImageBackground source={ImageBackgroundUri} resizeMode="cover" style={styles.container}>
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
          <Button title="show/hide" onPress={() => setShowImagePicker(!showImagePicker)} />
          {showImagePicker ? <UnsplashImageSearch width={width*.75} height={height*.75} searchQuery={titleText} updateBackground={updateImageBackground}></UnsplashImageSearch> : null}
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