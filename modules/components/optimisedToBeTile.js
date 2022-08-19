import React, { useState } from 'react';
import { StyleSheet, View, ImageBackground, TouchableHighlight, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteToBeItemById } from '../database/database';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';

const defaultBackgroundImage = require('../../assets/addNew.jpg');

function OptimisedToBeTile({toBeId, title, imageBackgroundUri, tintColor, onPress, onDelete, navigation}) {
  const [deleteMode, setDeleteMode] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'Are you sure?',
      `All data associated with your to be item "${title}" will be lost.`,
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
                  deleteLocallyStoredImage(imageBackgroundUri);
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
      underlayColor={'#ffffff'}
      onLongPress={beginDeletePath}
    >
      <ImageBackground
        style={styles.tileImageBackground}
        imageStyle={{ borderRadius: 4 }}
        source={{ uri: imageBackgroundUri }}
        defaultSource={defaultBackgroundImage}
      >
        {!deleteMode
        && (
          <Text style={{color: tintColor, fontSize: 22}}>
            {title}
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
    elevation: 2,
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

export default OptimisedToBeTile;
