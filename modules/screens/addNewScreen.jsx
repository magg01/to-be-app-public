/* eslint-disable react/style-prop-object */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, {
  useState, useRef, useCallback, useLayoutEffect, useEffect,
} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeIn, Layout, FadeOut } from 'react-native-reanimated';
import ColorPicker from 'react-native-wheel-color-picker';
import * as NavigationBar from 'expo-navigation-bar';
import UnsplashImageSearch from '../components/unsplashImageSearch';
import { addToBeItem } from '../database/database';
import CONSTANT_STRINGS from '../strings/constantStrings';
import colors from '../utils/colors';
import animations from '../utils/animations';
import { addNewScreenViewEnum } from '../utils/enums';

const { height, width } = Dimensions.get('window');
const defaultBackgroundImage = require('../../assets/addNew.jpg');

function AddNewScreen({ navigation }) {
  const [titleText, updateTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(addNewScreenViewEnum.titleInput);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [tintColor, setTintColor] = useState(colors.toBes.defaultTintColor);
  const headerHeight = useHeaderHeight();
  const [imageBackgroundUri, setImageBackgroundUri] = useState(defaultBackgroundImage);
  const textInputRef = useRef(null);

  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('white');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const backMethods = {
    backTotitleInputView: () => {
      setViewMode(addNewScreenViewEnum.titleInput);
    },
    backToImagePickerView: () => {
      setTintColor(colors.general.defaultWhite);
      setColorPickerVisible(false);
      setImageBackgroundUri(defaultBackgroundImage);
      setViewMode(addNewScreenViewEnum.imagePicker);
      navigation.setOptions({
        headerRight: () => null,
      });
    },
  };

  useEffect(() => {
    if (viewMode === addNewScreenViewEnum.review) {
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
      setViewMode(addNewScreenViewEnum.titleInput);
      updateTitleText('');
      setSearchQuery('');
      setImageBackgroundUri(defaultBackgroundImage);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (viewMode === addNewScreenViewEnum.imagePicker) {
          backMethods.backTotitleInputView();
          return true;
        }
        if (viewMode === addNewScreenViewEnum.review) {
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
              if (viewMode === addNewScreenViewEnum.imagePicker){
                backMethods.backTotitleInputView();
              }
              else if(viewMode === addNewScreenViewEnum.review){
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

  const proceedToReviewView = (uri) => {
    setImageBackgroundUri({ uri });
    setViewMode(addNewScreenViewEnum.review);
  };

  const skipImageSelection = () => {
    setViewMode(addNewScreenViewEnum.review);
  };

  const onNewSave = () => {
    addToBeItem(titleText, imageBackgroundUri.uri, tintColor);
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={imageBackgroundUri}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.outerContainer}>
        {viewMode === addNewScreenViewEnum.titleInput && (
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
                setViewMode(addNewScreenViewEnum.imagePicker);
              }}
              value={titleText}
              textAlign="center"
              showSoftInputOnFocus
              selectionColor="white"
              returnKeyType="done"
            />
          </Animated.View>
        )}
        {viewMode === addNewScreenViewEnum.imagePicker
            && (
            <>
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
                  style={styles.unsplashContainer}
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
              <Animated.View
                style={styles.bottomButtonContainer}
                entering={animations.addNewScreen.bottomButtons.entering()}
                exiting={animations.addNewScreen.bottomButtons.exiting()}
              >
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={skipImageSelection}
                >
                  <Text style={styles.bottomButtonText}>Skip for now</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
            )}
        {viewMode === addNewScreenViewEnum.review
          && (
            <>
              <View style={[styles.container, styles.containerReview]}>
                <Animated.Text
                  style={[styles.titleTextReview, { color: tintColor }]}
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
                  style={styles.colorPicker(headerHeight, tintColor)}
                  entering={animations.addNewScreen.colorPicker.entering()}
                  exiting={animations.addNewScreen.colorPicker.exiting()}
                >
                  <ColorPicker
                    color={tintColor}
                    onColorChange={(color) => setTintColor(color)}
                    thumbSize={30}
                    gapSize={10}
                    sliderSize={20}
                    noSnap
                    row
                    swatches={false}
                  />
                </Animated.View>
              )}
              <Animated.View
                style={styles.bottomButtonContainer}
                entering={animations.addNewScreen.bottomButtons.entering()}
                exiting={animations.addNewScreen.bottomButtons.exiting()}
              >
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={onNewSave}
                >
                  <Text style={styles.bottomButtonText}>Save</Text>
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
  outerContainer: {
    flex: 1,
  },
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
    borderBottomColor: colors.general.defaultWhite,
    padding: 6,
    fontSize: 36,
    color: colors.general.defaultWhite,
  },
  titleTextReview: {
    alignSelf: 'center',
    margin: 12,
    fontSize: 36,
    color: colors.general.defaultWhite,
  },
  imagePickerInstructions: {
    marginBottom: 24,
    marginTop: 12,
    fontSize: 20,
    color: colors.general.defaultWhite,
  },
  bottomButtonContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomButton: {
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.general.defaultWhite,
    borderRadius: 8,
  },
  bottomButtonText: {
    color: colors.plans.textOrIconOnWhite,
  },
  colorPicker: (headerHeight, tintColor) => ({
    width: 300,
    height: 250,
    backgroundColor: colors.plans.planViewBackground,
    borderRadius: 6,
    padding: 2,
    position: 'absolute',
    top: headerHeight,
    right: 10,
    borderColor: tintColor,
    borderWidth: 1,
  }),
  unsplashContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default AddNewScreen;
