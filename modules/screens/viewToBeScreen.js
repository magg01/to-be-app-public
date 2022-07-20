import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ImageBackground, Button, Alert, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 
import * as db from '../database/database';
import { useFocusEffect } from '@react-navigation/native';

export default ViewToBeScreen = ({route, navigation}) => {
  const [toBeId, setToBeId] = useState(route.params.toBeId);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [plans, setPlans] = useState(null);
  const [detailMode, setDetailMode] = useState(false);

  useEffect(() => {
    db.getToBeItemById(toBeId)
    .then((result) => {
      console.log(`ViewToBeScreen: useEffect getToBeItemById = ${JSON.stringify(result,null, 1)}`)
      setToBeItem(result);
    })
  }, [toBeId])

  useEffect(() => {
    if(detailMode){
      db.getAllPlansByToBeId(toBeId)
      .then((result) => {
        setPlans(result);
      })
    }
  }, [detailMode])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if(detailMode){
          setDetailMode(false);
          return true
        } else {
          return false
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [detailMode])
  )

  if(toBeItem === undefined){
    return (
      <SafeAreaView style={styles.container}>
        <Text>Fetching from database</Text>
      </SafeAreaView>
    )
  } else if (detailMode) {
    return (
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
          <Text style={{color: 'white'}}>This is detail mode</Text>
        </SafeAreaView>
        <StatusBar style={'light'} />
      </ImageBackground>
    )
  } else {
    return(
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
          <Button title={"next"} onPress={() => {
            db.getNextToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
          <Button title={"previous"} onPress={() => {
            db.getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
          <Button title={"details"} onPress={() => {setDetailMode(true)}} />
          <Button title={"delete"} onPress={() => {
            Alert.alert(
              'Are you sure?',
              'All associated data will be lost',
              [
                {
                  text: 'Cancel',
                  onPress: () => null,
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  onPress: () =>  {
                    db.deleteToBeItemById(toBeId)
                    .then((deleted) => {
                    deleted ? navigation.goBack() : Alert.alert("There was a problem deleting your to be. Please try again.");
                    })
                  },
                  style: 'destructive',
                },
              ],
              {
                cancelable: true,
              }
            );
          }} />
        </SafeAreaView>
        <StatusBar style={'light'} />
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