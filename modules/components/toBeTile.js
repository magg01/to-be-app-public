import React, { useEffect, useState } from 'react';
import {StyleSheet, View, ImageBackground, TouchableHighlight, Text } from 'react-native';
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
      <TouchableHighlight
        style={styles.toBeTile}
        onPress={props.onPress}
        underlayColor={'white'}
      >
        <ImageBackground
          style={styles.tileImageBackground}
          imageStyle={{borderRadius: 4}}
          source={{uri: toBeItemDetails.imageBackgroundUri}}
          // defaultSource={require("./assets/cocktail-shaker.png")}
        >
          <Text style={{color: 'white', fontSize: 22}}>
            {toBeItemDetails.title}
          </Text>
        </ImageBackground>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  toBeTile: {
    flex: 1,
    margin: 6,
    borderRadius: 4,
    elevation: 4,
  },
  tileImageBackground: {
    flex: 1,
    aspectRatio: 1,
    height: "100%",
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center'
  },
})
