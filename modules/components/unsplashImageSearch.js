import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, ImageBackground, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { downloadRemoteImageToLocalStorage } from '../FileSystem/fileSystem';
import CONSTANT_STRINGS from '../strings/constantStrings';
import { apiMethods } from '../utils/unsplashApi';

const {width, height} = Dimensions.get('window');

const loadingImage = require('../../assets/icon.png');

const UnsplashImageSearch = (props) => {
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [data, setPhotosResponse] = useState(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if(flatListRef.current != null && data.response.results.length > 0) {
      flatListRef.current.scrollToIndex({animated: false, index: 0})
    }
  }, [data])

  useEffect(() => {
    setSearchQuery(props.searchQuery)
  }, [props.searchQuery])

  useEffect(() => {
    if(searchQuery != undefined){
    // console.log(`searchQuery is ${searchQuery.toLowerCase()}`);
    apiMethods.apiGetPhotos({ query: searchQuery.toLowerCase(), orientation: "portrait", page: 1, perPage: 30})
      .then(result => {
        // console.log(JSON.stringify(result, null, 1))
        setPhotosResponse(result);
      })
      .catch((e) => {
        console.log(`DisplayWindow encountered an error -> ${e}`);
      });
    }
  }, [searchQuery]);

  const PhotoItemForFlatList = ({ photo }) => {
    const {urls, user} = photo;
    return (
      <ImageBackground 
        style={{
          width: props.width, 
          flexDirection: 'column', 
          justifyContent:'flex-end', 
          alignItems: 'flex-end', 
          resizeMode:"contain",
        }} 
        source={{uri: urls.regular}}
        defaultSource={loadingImage}
      >
        <TouchableOpacity 
          style={{width: 100, height: 25, backgroundColor:'#ccc', opacity: 0.8, alignItems: 'center', justifyContent: 'center', alignSelf:'center', borderRadius: 5, marginBottom: 10}}
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
        <Text style={{color: "white", fontSize: 10}}>{`${user.name} / Unsplash`}</Text>
      </ImageBackground>
    );
  };

  
  const onImageSelectionMade = (photo) => {
    setDownloadStarted(true);
    downloadImageFromUnsplash(photo)
    .then((localFileUri) => {
      props.onImageDownload(localFileUri);
    })
    .catch((error) => {
      console.error(`onImageSelectionMade encountered an error -> ${error}`);
    });    
  }

  const downloadImageFromUnsplash = (photo) => {
    apiMethods.notifyUnsplashOfImageDownload(photo);
    return downloadRemoteImageToLocalStorage(photo.urls.regular, photo.id);
  }

  if (data === null) {
    return (
      <View style={{height: props.height, width: props.width}} >
        <ActivityIndicator accessibilityRole='progressbar' />
        <StatusBar style="auto" />
      </View>
    );
  } else if (data.errors) {
    return (
      <View>
        <Text>{data.errors[0]}</Text>
        <Text>{CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH_ON_ERROR_RESPONSE_MESSAGE}</Text>
        <StatusBar style="auto" />
      </View>
    );
  } else {
    return (
      <View style={{height: props.height, width: props.width}} >
        <TextInput 
          style={{width: props.width, backgroundColor: 'lightgray'}} 
          onSubmitEditing={(event) => setSearchQuery(event.nativeEvent.text)} 
          returnKeyType='search' 
          placeholder={CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH_INPUT_PLACEHOLDER}
        />
        <FlatList 
          ref={flatListRef} 
          renderItem={({item}) => <PhotoItemForFlatList photo={item} />}
          data={data.response.results} 
          horizontal={true} 
          keyExtractor={item => item.id} 
          pagingEnabled={true}
          decelerationRate={'fast'}
          persistentScrollbar={true}
          initialNumToRender={5}
        />
        <StatusBar style="auto" />
      </View>
    );
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UnsplashImageSearch;