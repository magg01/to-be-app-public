import React, { useEffect, useState } from 'react';
import {StyleSheet, View, ImageBackground, TouchableHighlight, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToBeItemById, deleteToBeItemById } from '../database/database';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';

const defaultBackgroundImage = require('../../assets/addNew.jpg');

function ToBeTile({ toBeId, onPress, onDelete }) {
  const [toBeItem, setToBeItem] = useState(undefined);
  const [deleteMode, setDeleteMode] = useState(false);
  const [tintColor, setTintColor] = useState('#ffffff');

  useEffect(() => {
    // console.log(`here ${JSON.stringify(toBeItem, null, 1)}`)
    if (__DEV__) {
      const devDelayTimer = setTimeout(() => {
        getToBeItemById(toBeId)
          .then((result) => {
            setToBeItem(result);
          });
      }, 500);
      return (() => clearTimeout(devDelayTimer));
    }
    getToBeItemById(toBeId)
      .then((result) => setToBeItem(result));
  }, [toBeId]);

  useEffect(() => {
    if (toBeItem !== undefined) {
      setTintColor(toBeItem.tintColor);
    }
  }, [toBeItem]);

  const confirmDelete = () => {
    Alert.alert(
      'Are you sure?',
      `All data associated with your to be item "${toBeItem.title}" will be lost.`,
      [
        {
          text: 'Cancel',
          onPress: () => setDeleteMode(!deleteMode),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteToBeItemById(toBeId)
              .then((deleted) => {
                if (deleted) {
                  // TODO: implement check if this is the only use of the image
                  // before deleting (another tobe might be sharing this image filepath)
                  deleteLocallyStoredImage(toBeItem.imageBackgroundUri);
                  onDelete();
                }
              })
              .catch((err) => {
                console.error(`confirmDelete encountered an error -> ${err}`);
                Alert.alert("There was a problem deleting your to be. Please try again.");
              });
          },
          style: 'destructive',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  if (toBeItem === undefined) {
    return (
      <View style={styles.toBeTile}>
        <ImageBackground
          style={styles.tileImageBackground}
          imageStyle={{ borderRadius: 4 }}
          source={defaultBackgroundImage}
        >
          <ActivityIndicator size={'large'} />
        </ImageBackground>
      </View>
    );
  }
  return (
    <TouchableHighlight
      style={styles.toBeTile}
      onPress={onPress}
      underlayColor={'#ffffff'}
      onLongPress={() => setDeleteMode(!deleteMode)}
    >
      <ImageBackground
        style={styles.tileImageBackground}
        imageStyle={{ borderRadius: 4 }}
        source={{ uri: toBeItem.imageBackgroundUri }}
        // defaultSource={require()}
      >
        {!deleteMode
        && (
          <Text style={{color: tintColor, fontSize: 22}}>
            {toBeItem.title}
          </Text>
        )}
        {deleteMode
        && (
          <View style={styles.deleteView}>
            <Ionicons name="trash-outline" size={42} color={tintColor} onPress={confirmDelete} />
          </View>
        )}
      </ImageBackground>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  toBeTile: {
    flex: 1,
    margin: 6,
    borderRadius: 6,
    elevation: 4,
  },
  tileImageBackground: {
    flex: 1,
    aspectRatio: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteView: {
    flexGrow: 1,
    width: "100%",
    borderWidth: 2,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  }
});

export default ToBeTile;
