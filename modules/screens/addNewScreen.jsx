import React, {
  useState, useRef, useCallback,
} from 'react';
import {
  StyleSheet, View, ImageBackground, Text, TextInput, Dimensions, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { Layout } from 'react-native-reanimated';
import UnsplashImageSearch from '../components/unsplashImageSearch';
import { addToBeItem } from '../database/database';

const { height, width } = Dimensions.get('window');
const defaultBackgroundImage = require('../../assets/addNew.jpg');

function AddNewScreen({ navigation }) {
  const [titleText, updateTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageBackgroundUri, setImageBackgroundUri] = useState(defaultBackgroundImage);
  const textInputRef = useRef(null);

  // reset the screen to initial state when focussed. When switching tabs this resets this screen
  // when blurred and then refocussed
  useFocusEffect(
    useCallback(() => {
      setShowSaveButton(false);
      setShowImagePicker(false);
      updateTitleText('');
      setSearchQuery('');
      setImageBackgroundUri(defaultBackgroundImage);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (textInputRef.current != null) {
        textInputRef.current.focus();
      }
    }, [textInputRef]),
  );

  const updateImageBackground = (uri) => {
    setShowImagePicker(false);
    setImageBackgroundUri({ uri });
    setShowSaveButton(true);
  };

  const onNewSave = () => {
    addToBeItem(titleText, imageBackgroundUri.uri);
    navigation.goBack();
  };

  return (
    <ImageBackground source={imageBackgroundUri} resizeMode='cover' style={styles.backgroundImage}>
      <SafeAreaView style={{flex:1, alignItems: 'center', justifyContent: 'flex-start'}}>
        <View style={[styles.container, showImagePicker ? {justifyContent: 'flex-start'} : {justifyContent: 'center'}]}>
          <Animated.View layout={showImagePicker ? Layout.duration(1000) : null}>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              onChangeText={updateTitleText}
              onSubmitEditing={(e) => {
                setSearchQuery(e.nativeEvent.text);
                setShowImagePicker(true);
              }}
              value={titleText}
              textAlign="center"
              showSoftInputOnFocus
              selectionColor="white"
              returnKeyType="done"
            />
          </Animated.View>
        </View>
        {showImagePicker
          ? (
            <UnsplashImageSearch
              width={width*0.65}
              height={height*0.65}
              providedSearchQuery={searchQuery}
              onImageDownload={updateImageBackground}
            />
          )
          : null}
        {showSaveButton
          ? (
            <TouchableOpacity
              style={{backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4}}
              onPress={onNewSave}
            >
              <Text>Save</Text>
            </TouchableOpacity>
          )
          : null}
        <StatusBar style="auto" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: '8%',
  },
  input: {
    width: '60%',
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 36,
    color: 'white',
  },
});

export default AddNewScreen;
