import React, { useEffect, useState } from 'react';
import {StyleSheet, View, Image, TouchableHighlight, Text } from 'react-native';
import { getToBeItemById } from '../database/database';

export function ToBeTile(props){
  const [toBeItemDetails, setToBeItemDetails] = useState(undefined);

  useEffect(() => {
    getToBeItemById(props.toBeId).then((toBeItem) => {
      console.log(`here ${JSON.stringify(toBeItem, null, 1)}`)
      setToBeItemDetails(toBeItem);
    })
  }, [])


  if(toBeItemDetails === undefined){
    return (
      <View style={[styles.tileImageAndTitle, {backgroundColor: 'red'}]}>
        <Text>Loading</Text>
      </View>
    )
  } else {
    return(
      <View style={styles.toBeTile}>
        <TouchableHighlight
          onPress={props.onPress}
          underlayColor={ 'transparent' }
          >
          <View style={[styles.tileImageAndTitle, {backgroundColor: 'blue'}]}>
            <Image
              style={styles.tileImage}
              source={{uri: toBeItemDetails.imageBackgroundUri}}
              // defaultSource={require("./assets/cocktail-shaker.png")}
              />
            <Text style={{color: 'white'}}>
              {toBeItemDetails.title}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  toBeTile: {
    flex: 1,
    margin: 10,
    borderRadius: 4,
    elevation: 4,
  },
  tileImageAndTitle: {
    aspectRatio: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  tileImage: {
    flex: 1,
    height: "100%",
    width: "100%",
    borderRadius: 4
  },
})
