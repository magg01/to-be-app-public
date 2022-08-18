/* eslint-disable */
import React, { useState } from 'react';
import {
  Text, ActivityIndicator, ImageBackground, TouchableOpacity, View
} from 'react-native';
import { downloadRemoteImageToLocalStorage } from '../FileSystem/fileSystem';
import { apiMethods } from '../utils/unsplashApi';

const downloadImageFromUnsplash = (photo) => {
  apiMethods.notifyUnsplashOfImageDownload(photo);
  return downloadRemoteImageToLocalStorage(photo.urls.regular, photo.id);
};

function UnsplashPhotoListItem({ photo, onImageDownload, width }) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {urls, user} = photo;

  const onImageSelectionMade = (photo) => {
    setDownloadStarted(true);
    downloadImageFromUnsplash(photo)
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
              <ActivityIndicator size={'large'}/>
            </View>
          );
        }
      })()}
      <TouchableOpacity 
        style={{width: 100, height: 25, backgroundColor:'#ccc', opacity: 0.8, alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginBottom: 10}}
        onPress={() =>
          downloadStarted ?
          null
          :
          onImageSelectionMade(photo)}
      >
          { downloadStarted ? 
            <ActivityIndicator /> 
            :
            <Text style={{color: 'white'}}>Choose image</Text>
          }
      </TouchableOpacity>
      <Text style={{color: "white", fontSize: 10, alignSelf: 'flex-end', marginRight: 4}}>{`${user.name} / Unsplash`}</Text>
    </ImageBackground>
  );
}

export default UnsplashPhotoListItem;
