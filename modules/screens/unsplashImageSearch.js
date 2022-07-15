import { setupURLPolyfill } from 'react-native-url-polyfill';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, ImageBackground, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createApi } from "unsplash-js";
import * as FileSystem from 'expo-file-system';
import UnsplashKeys from '../../local/unsplashkeys';

setupURLPolyfill();
const {width, height} = Dimensions.get('window');

const loadingImage = require('../../assets/icon.png');

export default function UnsplashImageSearch(props) {
  const [searchQuery, setSearchQuery] = useState(props.searchQuery);
  const [data, setPhotosResponse] = useState(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const flatListRef = useRef(null);

  const api = createApi({
    accessKey: UnsplashKeys.accessKey,
  });

  useEffect(() => {
    if(flatListRef.current != null && data.response.results.length > 0) {
      flatListRef.current.scrollToIndex({animated: false, index: 0})
    }
  }, [data])

  useEffect(() => {
    console.log(`searchQuery is ${searchQuery.toLowerCase()}`);
    api.search
      .getPhotos({ query: searchQuery.toLowerCase(), orientation: "portrait", page: 1, perPage: 30})
      .then(result => {
        setPhotosResponse(result);
      })
      .catch((e) => {
        console.log(`DisplayWindow encountered an error -> ${e}`);
      });
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
          onPress={() => onImageBackgroundSelect(photo)}
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

  const onImageBackgroundSelect = (photo) => {
    setDownloadStarted(true);
    downloadImageFromUnsplash(photo)
    .then((uri) => {
      props.updateBackground(uri);
    });    
  }

  const downloadImageFromUnsplash = (photo) => {
    api.photos.trackDownload({ downloadLocation: photo.links.download_location });
    const {user, urls} = photo
    return new Promise((resolve, reject) => {
      FileSystem.downloadAsync(
          urls.regular,
          FileSystem.documentDirectory + photo.id
      )
      .then(({ uri }) => {
        console.log('Finished downloading to ', uri);
        resolve(uri);
      })
      .catch(error => {
        console.error(`DownloadAsync encountered an error -> ${error}`);
        reject("Failed");        
      });
    })
  }


  if (data === null) {
    return (
      <View style={{height: props.height, width: props.width}} >
        <ActivityIndicator />
        <StatusBar style="auto" />
      </View>
    );
  } else if (data.errors) {
    return (
      <View>
        <Text>{data.errors[0]}</Text>
        <Text>We're sorry, there was an error getting images from Unsplash</Text>
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
          placeholder={"Search Unsplash for images"}
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
