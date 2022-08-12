import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, ImageBackground, Button, Alert, BackHandler, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; 
import * as db from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';
import PlanView from '../components/plans';
import AddPlan from '../components/addPlan';

export default ViewToBeScreen = ({route, navigation}) => {
  const [toBeId, setToBeId] = useState(route.params.toBeId);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    if(__DEV__){
      let dev_delay_timer = setTimeout(() => {
        db.getToBeItemById(toBeId)
        .then((result) => {
          console.log(`ViewToBeScreen: useEffect getToBeItemById = ${JSON.stringify(result,null, 1)}`)
          setToBeItem(result);
        })
      }, 500)
      return (() => clearTimeout(dev_delay_timer))
    } else {
      db.getToBeItemById(toBeId)
      .then((result) => {
        console.log(`ViewToBeScreen: useEffect getToBeItemById = ${JSON.stringify(result,null, 1)}`)
        setToBeItem(result);
      })
    }
  }, [toBeId])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if(viewMode === 'detail'){
          setViewMode('overview');
          return true
        } else if(viewMode === 'addPlan') {
          setViewMode('detail')
          return true
        } else {
          return false
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [viewMode])
  )

  const onNewPlanAdded = () => {
    setViewMode('detail');
  }

  if(toBeItem === undefined){
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size={'large'}/>
      </SafeAreaView>
    )
  } else if (viewMode === 'detail') {
    return (
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
          <PlanView toBeId={toBeId} />
          <TouchableOpacity style={styles.addButton} onPress={() => setViewMode('addPlan')}>
            <Text>new</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <StatusBar style={'light'} />
      </ImageBackground>
    )
  } else if (viewMode === 'addPlan') {
    return (
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <AddPlan toBeId={toBeId} onAddNewPlan={onNewPlanAdded} />
        </SafeAreaView>
        <StatusBar style={'light'} />
      </ImageBackground>
    )
  } else {
    return(
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36, alignSelf: 'center'}}>{toBeItem.title}</Text>
          <Button title={"next"} onPress={() => {
            db.getNextToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
          <Button title={"previous"} onPress={() => {
            db.getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result))
          }}/>
          <Button title={"details"} onPress={() => {setViewMode('detail')}} />
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
                      if(deleted){
                        //TODO: implement check if this is the only use of the image before deleting (another tobe might be sharing this image filepath)
                        deleteLocallyStoredImage(toBeItem.imageBackgroundUri);
                        navigation.goBack(); 
                      } else {
                        Alert.alert("There was a problem deleting your to be. Please try again.");
                      }
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
    justifyContent: 'center',
    paddingHorizontal: "8%",
  },
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white'
  }
});