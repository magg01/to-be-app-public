import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ImageBackground, Text, TextInput, Button, Alert, Dimensions, TouchableOpacity } from 'react-native';
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
    setShowSaveButton(true);
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
          <View style={{flex: 1}} />
          {showSaveButton ? <TouchableOpacity style={{backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4}} onPress={() => Alert.alert('save it here')} ><Text>Save</Text></TouchableOpacity> : null}
          <StatusBar style="auto" />
        </SafeAreaView>
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      flexDirection: 'column',
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