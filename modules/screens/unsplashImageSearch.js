import { setupURLPolyfill } from 'react-native-url-polyfill';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, ImageBackground, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createApi } from "unsplash-js";
import * as FileSystem from 'expo-file-system';
import UnsplashKeys from '../../local/unsplashkeys';

setupURLPolyfill();
const {width, height} = Dimensions.get('window');

export default function UnsplashImageSearch(props) {
  const [searchText, setSearchText] = useState('mountains');
  const [data, setPhotosResponse] = useState(null);
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
    console.log(`searchQuery is ${props.searchQuery.toLowerCase()}`);
    api.search
      .getPhotos({ query: props.searchQuery.toLowerCase(), orientation: "portrait", page: 1, perPage: 30})
      .then(result => {
        setPhotosResponse(result);
      })
      .catch((e) => {
        console.log(`DisplayWindow encountered an error -> ${e}`);
      });
  }, [props.searchQuery]);

  const PhotoItemForFlatList = ({ photo }) => {
    const { user, urls } = photo;
    return (
      <ImageBackground 
        style={{width: width* .75, flexDirection: 'column', justifyContent:'flex-end', alignItems: 'flex-end', resizeMode:"contain"}} 
        source={{uri: urls.regular}}
      >
        <TouchableOpacity 
            style={{width: 100, height: 25, backgroundColor:'#ccc', opacity: 0.8, alignItems: 'center', justifyContent: 'center', alignSelf:'center', borderRadius: 5, marginBottom: 10}}
            onPress={() => {
            api.photos.trackDownload({ downloadLocation: photo.links.download_location });
            FileSystem.downloadAsync(
                urls.regular,
                FileSystem.documentDirectory + photo.id
            )
                .then(({ uri }) => {
                console.log('Finished downloading to ', uri);
                })
                .catch(error => {
                console.error(`DownloadAsync encountered an error -> ${error}`);
                Alert.alert("There was an error downloading this image");
                });
            }}
        >
            <Text style={{color: 'white'}}>Choose image</Text>
        </TouchableOpacity>
        <Text style={{color: "white", fontSize: 10}}>{`${user.name} / Unsplash`}</Text>
      </ImageBackground>
    );
  };


  if (data === null) {
    return (
      <View style={{height: height *.75, width: width *.75}} >
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
      <View style={{height: height *.75, width: width *.75}} >
        <TextInput 
          style={{width: width*.75, backgroundColor: 'lightgray'}} 
          onSubmitEditing={(event) => setSearchText(event.nativeEvent.text)} 
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
