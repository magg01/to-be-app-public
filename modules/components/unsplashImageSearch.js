/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ActivityIndicator, FlatList, TextInput,
} from 'react-native';
import UnsplashPhotoItemForFlatList from './unsplashPhotoItemForFlatlist';
import CONSTANT_STRINGS from '../strings/constantStrings';
import { apiMethods } from '../utils/unsplashApi';

function UnsplashImageSearch({ onImageDownload, width, height, providedSearchQuery}) {
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [data, setPhotosResponse] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // when the data object is modified and the response has images present
    //  scroll the flatlist to its beginning
    if (flatListRef.current != null && data.response.results.length > 0) {
      flatListRef.current.scrollToIndex({ animated: false, index: 0 });
    }
    console.log(`the [data] useEffect fired`);
  }, [data]);

  useEffect(() => {
    setSearchInput('');
    setSearchQuery(providedSearchQuery);
    console.log("the [providedSearchQuery] useEffect fired");
  }, [providedSearchQuery]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setPhotosResponse(null);
      if (searchQuery === '') {
        // set data to no results without calling the api.
        setPhotosResponse({ response: { results: [] } });
      } else {
        apiMethods.apiGetPhotos({
          query: searchQuery.toLowerCase().trim(),
          orientation: 'portrait',
          page: 1,
          perPage: 30,
        })
          .then((result) => {
            setPhotosResponse(result);
          })
          .catch((e) => {
            console.log(`apiGetPhotos encountered an error -> ${JSON.stringify(e, null, 1)}`);
          });
      }
    }
    console.log("the [searchQuery] useEffect fired");
  }, [searchQuery]);


  return (
    <View style={{height: height, width: width, alignItems: 'center'}}>
      <TextInput
        style={{width: width * 0.8, backgroundColor: 'white', marginBottom: 20, borderRadius: 5, padding: 6, opacity: 0.9}}
        onSubmitEditing={() => setSearchQuery(searchInput)}
        onChangeText={setSearchInput}
        value={searchInput}
        returnKeyType="search"
        placeholder={CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER}
      />
      {(() => {
        if (data === null) {
          return <ActivityIndicator accessibilityRole='progressbar' />
        }
        if (data.errors) {
          return (
            <View>
              <Text>{data.errors[0]}</Text>
              <Text>{CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE}</Text>
            </View>
          );
        }
        if (data.response.results.length === 0) {
          return <Text>{CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_NO_RESULTS_MESSAGE}</Text>;
        }
        return (
          <View style={{flex: 1, borderRadius: 6, overflow: 'hidden'}}>
            <FlatList
              ref={flatListRef}
              renderItem={({ item }) => <UnsplashPhotoItemForFlatList photo={item} onImageDownload={onImageDownload} width={width} height={height} />}
              data={data.response.results}
              horizontal
              keyExtractor={(item) => item.id}
              pagingEnabled
              decelerationRate="fast"
              persistentScrollbar
              initialNumToRender={5}
              testID="photoItemFlatlist"
            />
          </View>
        );
      })()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UnsplashImageSearch;
