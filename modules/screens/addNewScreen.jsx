import React, {
  useState, useRef, useCallback, useEffect,
} from 'react';
import {
  StyleSheet, View, ImageBackground, Text, TextInput, Dimensions, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { EntryExitTransition, FadeIn, Layout, FadeOut, ZoomIn, ZoomOut, FadeOutUp, withDelay, SlideOutUp } from 'react-native-reanimated';
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

  // useFocusEffect(
  //   useCallback(() => {
  //     if (textInputRef.current !== null) {
  //       textInputRef.current.focus();
  //     }
  //   }, [textInputRef]),
  // );

  useEffect(() => {
    if (searchQuery !== '') {
      setShowImagePicker(true);
    }
  }, [searchQuery]);

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
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          {!showImagePicker && (
          <Animated.View
            style={{width: "100%", alignItems: 'center'}}
            entering={FadeIn.duration(1000).delay(500)}
            exiting={FadeOut.duration(1000)}
            layout={Layout.duration(1000)}
            key="test2"
          >
            <TextInput
              ref={textInputRef}
              style={styles.input}
              onChangeText={updateTitleText}
              onSubmitEditing={(e) => {
                setSearchQuery(e.nativeEvent.text);
              }}
              value={titleText}
              textAlign="center"
              showSoftInputOnFocus
              selectionColor="white"
              returnKeyType="done"
            />
          </Animated.View>
          )}
        </View>
        {showImagePicker
            && (
            <>
              <Animated.View
                style={{ width: "100%", alignItems: 'center' }}
                entering={FadeIn.duration(1000).delay(250)}
                exiting={FadeOut.duration(500)}
                key="test"
              >
                <TextInput
                  ref={textInputRef}
                  style={styles.input}
                  onChangeText={updateTitleText}
                  onSubmitEditing={(e) => {
                    setSearchQuery(e.nativeEvent.text);
                  }}
                  value={titleText}
                  textAlign="center"
                  showSoftInputOnFocus
                  selectionColor="white"
                  returnKeyType="done"
                />
              </Animated.View>
              <Animated.View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' }} entering={FadeIn.duration(1000).delay(500)}>
                <UnsplashImageSearch
                  width={width * 0.75}
                  height={height * 0.75}
                  providedSearchQuery={searchQuery}
                  onImageDownload={updateImageBackground} 
                />
              </Animated.View>
            </>
            )}
        {showSaveButton
          && (
            <Animated.View style={{alignItems: 'center'}} entering={FadeIn.duration(1000)}>
              <TouchableOpacity
                style={{backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4}}
                onPress={onNewSave}
              >
                <Text>Save</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        <StatusBar style="auto" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: '8%',
    justifyContent: 'center',
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
