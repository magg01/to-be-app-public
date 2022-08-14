import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, ImageBackground, Text, TextInput, Button, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnsplashImageSearch from '../components/unsplashImageSearch';
import { addToBeItem } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

const defaultBackgroundImage = require("../../assets/addNew.jpg");
const {height, width} = Dimensions.get('window');


const AddNewScreen = ({navigation}) => {
  const [titleText, updateTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageBackgroundUri, setImageBackgroundUri] = useState(defaultBackgroundImage);

  //reset the screen to initial state when focussed. When switching tabs this resets this screen
  //when blurred and then refocussed
  useFocusEffect(
    useCallback(() => {
      setShowSaveButton(false);
      setShowImagePicker(false);
      updateTitleText('');
      setSearchQuery('');
      setImageBackgroundUri(defaultBackgroundImage)
    },[])
  )
  
  const updateImageBackground = (uri) => {
    setShowImagePicker(false);
    setImageBackgroundUri({uri: uri});
    setShowSaveButton(true);
  }

  const onNewSave = () => {
    addToBeItem(titleText, imageBackgroundUri.uri);
    navigation.goBack();
  }

  return (
    <ImageBackground source={imageBackgroundUri} resizeMode="cover" style={styles.backgroundImage}>
      <SafeAreaView style={{flex:1, alignItems: 'center', justifyContent: 'flex-start'}}>
        <Animated.View style={[styles.container, showImagePicker ? {justifyContent: 'flex-start'} : {justifyContent: 'center'}]}>
          <TextInput
            style={styles.input} 
            onChangeText={updateTitleText}
            onSubmitEditing={(e) => {
              setSearchQuery(e.nativeEvent.text)
              setShowImagePicker(true);
            }}
            value={titleText} 
            textAlign={'center'}
            autoFocus={true}
            showSoftInputOnFocus={true}
            selectionColor={'white'}
          />
        </Animated.View>
        {showImagePicker ? <UnsplashImageSearch width={width*.65} height={height*.65} searchQuery={searchQuery} onImageDownload={updateImageBackground}></UnsplashImageSearch> : null}
        {showSaveButton ? <TouchableOpacity style={{backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4}} onPress={onNewSave} ><Text>Save</Text></TouchableOpacity> : null}
        <StatusBar style="auto" />
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: "8%",
  },
  input: {
    width: "60%",
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 36,
    color: 'white'
  },
});

export { AddNewScreen }