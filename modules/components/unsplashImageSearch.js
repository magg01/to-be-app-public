/* eslint-disable react/style-prop-object */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ActivityIndicator, FlatList, TextInput, Alert,
} from 'react-native';
import UnsplashPhotoListItem from './unsplashPhotoListItem';
import CONSTANT_STRINGS from '../strings/constantStrings';
import * as apiMethods from '../utils/unsplashApi';
import colors from '../utils/colors';

function UnsplashImageSearch({
  // eslint-disable-next-line react/prop-types
  onImageDownload, width, height, providedSearchQuery,
}) {
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
  }, [data]);

  useEffect(() => {
    setSearchInput('');
    setSearchQuery(providedSearchQuery);
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
          .catch(() => {
            Alert.alert(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE);
          });
      }
    }
  }, [searchQuery]);

  return (
    <View style={styles.container(width, height)}>
      <TextInput
        style={styles.imageSearchBar}
        onSubmitEditing={() => setSearchQuery(searchInput)}
        onChangeText={setSearchInput}
        value={searchInput}
        returnKeyType="search"
        placeholder={CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER}
        placeholderTextColor="#444"
      />
      {(() => {
        if (data === null) {
          return (
            <View style={styles.dataDisplayImages}>
              <ActivityIndicator accessibilityRole="progressbar" size="large" testID="fetchingDataActivityIndicator" />
            </View>
          );
        }
        if (data.errors) {
          return (
            <View style={styles.dataDisplayMessage}>
              <Text style={styles.messageText}>{data.errors[0]}</Text>
              <Text style={styles.messageText}>{'\n\n'}</Text>
              <Text style={styles.messageText}>
                {CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE}
              </Text>
            </View>
          );
        }
        if (data.response.results.length === 0) {
          return (
            <View style={styles.dataDisplayMessage}>
              <Text style={styles.messageText}>
                {CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_NO_RESULTS_MESSAGE}
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.dataDisplayImages}>
            <FlatList
              ref={flatListRef}
              renderItem={({ item }) => (
                <UnsplashPhotoListItem
                  photo={item}
                  onImageDownload={onImageDownload}
                  width={width}
                />
              )}
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
  container: (width, height) => ({
    width,
    height,
    alignItems: 'center',
  }),
  imageSearchBar: {
    width: '80%',
    backgroundColor: colors.general.defaultWhite,
    marginBottom: 20,
    borderRadius: 5,
    padding: 6,
    opacity: 0.9,
  },
  dataDisplayImages: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dataDisplayMessage: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: '20%',
  },
  messageText: {
    color: colors.general.defaultWhite,
    fontSize: 18,
  },
});

export default UnsplashImageSearch;
