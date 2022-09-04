/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import {
  StyleSheet, View, ImageBackground, TouchableHighlight, Text, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteToBeItemById, getAllPlansWithRepeatersAndCalEventsByToBeId, getNumberOfUsesForImage } from '../database/database';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';
import confirmDeleteAlert from '../utils/deleteConfirmation';
import colors from '../utils/colors';
import { cancelNotificationEvent } from '../utils/notifications';

const defaultBackgroundImage = require('../../assets/addNew.jpg');

function ToBeTile({
  toBeId, title, imageBackgroundUri, tintColor, onDelete, navigation,
}) {
  const [deleteMode, setDeleteMode] = useState(false);

  const deleteToBeItem = () => {
    // remove all notifications from repeaters and calevents
    getAllPlansWithRepeatersAndCalEventsByToBeId(toBeId)
      .then((plansOrRepeaters) => {
        for (let i = 0; i < plansOrRepeaters.length; i += 1) {
          const notificationIdPresent = (
            plansOrRepeaters[i].calevent_eventnotification
            ?? plansOrRepeaters[i].repeater_notificationId
          );
          if (notificationIdPresent) {
            cancelNotificationEvent(notificationIdPresent);
          }
        }
      })
      .then(() => {
        // check if any other tobes used the same imagebackgrounduri
        // if not delete the image file.
        if (getNumberOfUsesForImage(imageBackgroundUri) === 0) {
          deleteLocallyStoredImage(imageBackgroundUri);
        }
        // then delete tobeitem (delete then cascades to plans and repeaters)
        deleteToBeItemById(toBeId)
          .then((deleted) => {
            if (deleted) {
              onDelete();
            }
          });
      })
      .catch(() => {
        Alert.alert('There was a problem deleting your to be. Please try again.');
      });
  };

  const confirmDeleteToBe = () => {
    confirmDeleteAlert(
      'Delete this to be?',
      `All data associated with your to be item "${title}" will be lost.`,
      deleteToBeItem,
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
        source={imageBackgroundUri ? { uri: imageBackgroundUri } : defaultBackgroundImage}
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

export default ToBeTile;
