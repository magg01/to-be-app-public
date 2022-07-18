import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ImageBackground, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 
import { getPreviousToBeItemIdById, getToBeItemById, getNextToBeItemIdById } from '../database/database';

export default ViewToBeScreen = ({route}) => {
  const [toBeId, setToBeId] = useState(route.params.toBeId);
  const [toBeItem, setToBeItem] = useState(undefined);

  useEffect(() => {
    getToBeItemById(toBeId)
    .then((result) => {
      console.log(`ViewToBeScreen: useEffect getToBeItemById = ${JSON.stringify(result,null, 1)}`)
      setToBeItem(result);
    })
  }, [toBeId])

  if(toBeItem === undefined){
    return (
      <SafeAreaView style={styles.container}>
        <Text>Fetching from database</Text>
      </SafeAreaView>
    )
  } else {
    return(
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
          <Button title={"next"} onPress={() => {
            getNextToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
          <Button title={"previous"} onPress={() => {
            getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
        </SafeAreaView>
        <StatusBar style={'auto'} />
      </ImageBackground>
   )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});