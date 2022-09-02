/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import {
  StyleSheet, View, ImageBackground, TouchableHighlight, Text, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteToBeItemById, getNumberOfUsesForImage } from '../database/database';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import colors from '../utils/colors';

const defaultBackgroundImage = require('../../assets/addNew.jpg');

function OptimisedToBeTile({
  toBeId, title, imageBackgroundUri, tintColor, onDelete, navigation,
}) {
  const [deleteMode, setDeleteMode] = useState(false);

  const confirmDeleteToBe = () => {
    confirmDeleteAlert(
      'Delete this to be?',
      `All data associated with your to be item "${title}" will be lost.`,
      () => deleteToBeItemById(toBeId)
        .then((deleted) => {
          if (deleted) {
            if (getNumberOfUsesForImage(imageBackgroundUri) === 0) {
              deleteLocallyStoredImage(imageBackgroundUri);
            }
            onDelete();
          }
        })
        .catch(() => {
          Alert.alert('There was a problem deleting your to be. Please try again.');
        }),
      null,
    );
  };

  const beginDeletePath = () => {
    setDeleteMode(!deleteMode);
  };

  const navigate = () => {
    navigation.navigate('ViewToBeScreen', { toBeId });
  };

  return (
    <TouchableHighlight
      style={styles.toBeTile}
      onPress={navigate}
      underlayColor="#ffffff"
      onLongPress={beginDeletePath}
    >
      <ImageBackground
        style={styles.tileImageBackground}
        imageStyle={styles.imageBackgroundImageStyle}
        source={{ uri: imageBackgroundUri }}
        defaultSource={defaultBackgroundImage}
      >
        {!deleteMode
        && (
          <Text style={styles.titleText(tintColor)}>
            {title}
          </Text>
        )}
        {deleteMode
        && (
          <View style={styles.deleteView}>
            <Ionicons name="trash-outline" size={42} color={tintColor} onPress={confirmDeleteToBe} />
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
    elevation: 2,
    shadowColor: colors.general.defaultBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tileImageBackground: {
    flex: 1,
    aspectRatio: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackgroundImageStyle: {
    borderRadius: 4,
  },
  titleText: (tintColor) => ({
    color: tintColor,
    fontSize: 22,
  }),
  deleteView: {
    flexGrow: 1,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.general.defaultRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
});

export default OptimisedToBeTile;
