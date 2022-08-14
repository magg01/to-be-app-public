import React, { useState, useRef } from 'react';
import { StyleSheet, View, ImageBackground, Text, TextInput, Button, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnsplashImageSearch from '../components/unsplashImageSearch';
import { addToBeItem } from '../database/database';

const backgroundImage = require("../../assets/addNew.jpg");
const {height, width} = Dimensions.get('window');


const AddNewScreen = ({navigation}) => {
  const [titleText, updateTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageBackgroundUri, setImageBackgroundUri] = useState(backgroundImage);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
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
      <ImageBackground source={imageBackgroundUri} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <TextInput
            style={[styles.input, {marginTop: headerHeight - insets.top}]} 
            onChangeText={updateTitleText}
            onSubmitEditing={(e) => setSearchQuery(e.nativeEvent.text)}
            value={titleText} 
            textAlign={'center'}
            autoFocus={true}
            showSoftInputOnFocus={true}
            selectionColor={'white'}
          />
          <Button title="show/hide" onPress={() => setShowImagePicker(!showImagePicker)} />
          {showImagePicker ? <UnsplashImageSearch width={width*.75} height={height*.75} searchQuery={searchQuery} onImageDownload={updateImageBackground}></UnsplashImageSearch> : null}
          <View style={{flex: 1}} />
          {showSaveButton ? <TouchableOpacity style={{backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4}} onPress={onNewSave} ><Text>Save</Text></TouchableOpacity> : null}
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