import React, {
  useState, useRef, useCallback, useLayoutEffect, useEffect
} from 'react';
import {
  StyleSheet, View, ImageBackground, Text, TextInput, Dimensions, TouchableOpacity, BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeIn, Layout, FadeOut } from 'react-native-reanimated';
import ColorPicker from 'react-native-wheel-color-picker';
import UnsplashImageSearch from '../components/unsplashImageSearch';
import { addToBeItem } from '../database/database';
import CONSTANT_STRINGS from '../strings/constantStrings';

const { height, width } = Dimensions.get('window');
const defaultBackgroundImage = require('../../assets/addNew.jpg');

const viewEnum = {
  titleInput: 0,
  imagePicker: 1,
  review: 2,
};

function AddNewScreen({ navigation }) {
  const [titleText, updateTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(viewEnum.titleInput);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [tintColor, setTintColor] = useState("#ffffff");
  const headerHeight = useHeaderHeight();

  const [imageBackgroundUri, setImageBackgroundUri] = useState(defaultBackgroundImage);
  const textInputRef = useRef(null);

  const backMethods = {
    backTotitleInputView: () => {
      setViewMode(viewEnum.titleInput);
    },
    backToImagePickerView: () => {
      setTintColor('#ffffff');
      setColorPickerVisible(false);
      setImageBackgroundUri(defaultBackgroundImage);
      setViewMode(viewEnum.imagePicker);
      navigation.setOptions({
        headerRight: () => null,
      });
    },
  };

  useEffect(() => {
    if (viewMode === viewEnum.review) {
      navigation.setOptions({
        headerRight: () => (
          <Ionicons 
            onPress={() => setColorPickerVisible(!colorPickerVisible)} 
            style={{marginRight: 10}} 
            name={colorPickerVisible ? "close-circle-outline" : "color-palette-outline"} 
            size={26} 
            color={tintColor} 
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [colorPickerVisible, navigation, tintColor, viewMode]);

  // reset the screen to initial state when focussed. When switching tabs this resets this screen
  // when blurred and then refocussed
  useFocusEffect(
    useCallback(() => {
      setViewMode(viewEnum.titleInput);
      updateTitleText('');
      setSearchQuery('');
      setImageBackgroundUri(defaultBackgroundImage);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (viewMode === viewEnum.imagePicker) {
          backMethods.backTotitleInputView();
          return true;
        }
        if (viewMode === viewEnum.review) {
          backMethods.backToImagePickerView();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [viewMode, backMethods]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Animated.View entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>
          <HeaderBackButton 
            onPress={() => {
              if (viewMode === viewEnum.imagePicker){
                backMethods.backTotitleInputView();
              }
              else if(viewMode === viewEnum.review){
                backMethods.backToImagePickerView();
              } else {
                navigation.goBack();
              }
            }}
            tintColor={tintColor}
            labelVisible = {Platform.OS === 'ios' ? true : false}
          />
        </Animated.View>
      ),
    });
  });

  // useFocusEffect(
  //   useCallback(() => {
  //     if (textInputRef.current !== null) {
  //       textInputRef.current.focus();
  //     }
  //   }, [textInputRef]),
  // );

  const proceedToReviewView = (uri) => {
    setImageBackgroundUri({ uri });
    setViewMode(viewEnum.review);
  };

  const onNewSave = () => {
    addToBeItem(titleText, imageBackgroundUri.uri, tintColor);
    navigation.goBack();
  };

  return (
    <ImageBackground source={imageBackgroundUri} resizeMode='cover' style={styles.backgroundImage}>
      <SafeAreaView style={{flex: 1}}>
        {viewMode === viewEnum.titleInput && (
          <Animated.View
            style={styles.container}
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
                setViewMode(viewEnum.imagePicker);
              }}
              value={titleText}
              textAlign="center"
              showSoftInputOnFocus
              selectionColor="white"
              returnKeyType="done"
            />
          </Animated.View>
        )}
        {viewMode === viewEnum.imagePicker
            && (
            <View style={[styles.container, styles.containerImagePicker(headerHeight)]}>
              <Animated.Text
                style={styles.imagePickerInstructions}
                entering={FadeIn.duration(1000).delay(250)}
                exiting={FadeOut.duration(500)}
                key="test3"
              >
                {CONSTANT_STRINGS.ADD_NEW_SCREEN.IMAGE_PICKER_INSTRUCTION}
              </Animated.Text>
              <Animated.View 
                style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' }} 
                entering={FadeIn.duration(1000).delay(500)}
                exiting={FadeOut.duration(500)}
              >
                <UnsplashImageSearch
                  width={width * 0.75}
                  height={height * 0.75}
                  providedSearchQuery={searchQuery}
                  onImageDownload={proceedToReviewView}
                />
              </Animated.View>
            </View>
            )}
        {viewMode === viewEnum.review
          && (
            <>
              <View style={[styles.container, styles.containerReview]}>
                <Animated.Text
                  style={[styles.titleTextReview, {color: tintColor}]}
                  entering={FadeIn.duration(1000).delay(250)}
                  exiting={FadeOut.duration(500)}
                  key="test"
                >
                  {titleText}
                </Animated.Text>
              </View>
              {colorPickerVisible
              && (
                <Animated.View
                  style={{
                    width: 250,
                    height: 200,
                    backgroundColor: 'rgba(200,200,200,0.2)', 
                    borderRadius: 6,
                    padding: 2,
                    position: 'absolute',
                    top: headerHeight,
                    right: 10,
                    borderColor: tintColor,
                    borderWidth: 1,
                  }}
                  entering={FadeIn.duration(1000)}
                  exiting={FadeOut.duration(500)}
                >
                  <ColorPicker
                    color={tintColor}
                    onColorChange={(color) => setTintColor(color)}
                    onColorChangeComplete={(color) => console.log(`final color: ${color}`)}
                    thumbSize={30}
                    gapSize={10}
                    sliderSize={20}
                    noSnap
                    row
                    swatches={false}
                  />
                </Animated.View>
              )}
              <Animated.View style={{ alignItems: 'center' }} entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>
                <TouchableOpacity
                  style={{ backgroundColor: '#ccc', margin: 12, padding: 12, borderRadius: 4 }}
                  onPress={onNewSave}
                >
                  <Text>Save</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
      </SafeAreaView>
      <StatusBar style="light" />
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
    justifyContent: 'center',
    paddingHorizontal: '8%',
  },
  containerReview: {
    flexGrow: 1,
  },
  containerImagePicker: (headerHeight) => ({
    marginTop: headerHeight / 2,
  }),
  input: {
    width: '60%',
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 36,
    color: 'white',
  },
  titleTextImagePicker: {
    alignSelf: 'center',
    marginBottom: 12,
    fontSize: 36,
    color: 'white',
  },
  titleTextReview: {
    alignSelf: 'center',
    margin: 12,
    fontSize: 36,
    color: 'white',
  },
  imagePickerInstructions: {
    marginBottom: 24,
    marginTop: 12,
    fontSize: 20,
    color: 'white',
  },
});

export default AddNewScreen;
