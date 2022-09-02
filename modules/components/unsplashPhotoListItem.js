import React, { useState } from 'react';
import {
  Text, ActivityIndicator, ImageBackground, TouchableOpacity, View, StyleSheet
} from 'react-native';
import { downloadRemoteImageToLocalStorage } from '../FileSystem/fileSystem';
import * as apiMethods from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';
import colors from '../utils/colors';


function UnsplashPhotoListItem({ photo, onImageDownload, width }) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {urls, user} = photo;

  const onImageSelectionMade = (photo) => {
    setDownloadStarted(true);
    apiMethods.downloadImageFromUnsplash(photo)
      .then((localFileUri) => {
        onImageDownload(localFileUri);
      })
      .catch((error) => {
        console.error(`onImageSelectionMade encountered an error -> ${error}`);
      });
  };

  return (
    <ImageBackground 
      style={{
        flex: 1,
        width: width,
        justifyContent: 'flex-end', 
        alignItems: 'center',
        resizeMode: 'contain',
      }}
      source={{uri: urls.regular}}
      onLoad={() => {
        setIsLoading(false);
      }}
      testID={'unsplashPhotoListItem'}
    >
      {(() => {
        if (isLoading) {
          return(
            <View 
              style={{
                flex: 1,
                width: width,
                justifyContent: 'center', 
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size={'large'} accessibilityRole={'progressbar'}/>
            </View>
          );
        }
      })()}
      <TouchableOpacity 
        style={styles.bottomButton}
        onPress={() =>
          downloadStarted ?
          null
          :
          onImageSelectionMade(photo)}
      >
          { downloadStarted ? 
            <ActivityIndicator accessibilityRole={'progressbar'} testID={'chooseButtonActivityIndicator'}/> 
            :
            <Text style={styles.bottomButtonText}>{CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT}</Text>
          }
      </TouchableOpacity>
      <Text style={{color: "white", fontSize: 10, alignSelf: 'flex-end', marginRight: 4}}>{CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.IMAGE_ATTRIBUTION(user.name)}</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
    color: colors.plans.textOrIconOnWhite
  }
})

export default UnsplashPhotoListItem;
