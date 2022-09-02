/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Text, ActivityIndicator, ImageBackground, TouchableOpacity, View, StyleSheet,
} from 'react-native';
import * as apiMethods from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';
import colors from '../utils/colors';

function UnsplashPhotoListItem({ photo, onImageDownload, width }) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { urls, user } = photo;

  const onImageSelectionMade = (photoItem) => {
    setDownloadStarted(true);
    apiMethods.downloadImageFromUnsplash(photoItem)
      .then((localFileUri) => {
        onImageDownload(localFileUri);
      })
      .catch((error) => {
        console.error(`onImageSelectionMade encountered an error -> ${error}`);
      });
  };

  return (
    <ImageBackground
      style={styles.imageBackground(width)}
      source={{ uri: urls.regular }}
      onLoad={() => {
        setIsLoading(false);
      }}
      testID="unsplashPhotoListItem"
    >
      {isLoading
        && (
          <View style={styles.loadingContainer(width)}>
            <ActivityIndicator size="large" accessibilityRole="progressbar" />
          </View>
        )}
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => (downloadStarted
          ? null
          : onImageSelectionMade(photo)
        )}
      >
        {downloadStarted
          ? (
            <ActivityIndicator
              accessibilityRole="progressbar"
              testID="chooseButtonActivityIndicator"
            />
          )
          : (
            <Text style={styles.bottomButtonText}>
              {CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT}
            </Text>
          )}
      </TouchableOpacity>
      <Text style={styles.attributionText}>
        {CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.IMAGE_ATTRIBUTION(user.name)}
      </Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: (width) => ({
    flex: 1,
    width,
    justifyContent: 'flex-end',
    alignItems: 'center',
    resizeMode: 'contain',
  }),
  loadingContainer: (width) => ({
    flex: 1,
    width,
    justifyContent: 'center',
    alignItems: 'center',
  }),
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
  attributionText: {
    color: colors.general.defaultWhite,
    fontSize: 10,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
});

export default UnsplashPhotoListItem;
