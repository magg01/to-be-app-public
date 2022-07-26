import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ImageBackground, Button, Alert, BackHandler, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 
import * as db from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';
import PlanView from '../components/plans';

export default ViewToBeScreen = ({route, navigation}) => {
  const [toBeId, setToBeId] = useState(route.params.toBeId);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [plans, setPlans] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [newPlanTitle, setNewPlanTitle] = useState("");

  useEffect(() => {
    db.getToBeItemById(toBeId)
    .then((result) => {
      console.log(`ViewToBeScreen: useEffect getToBeItemById = ${JSON.stringify(result,null, 1)}`)
      setToBeItem(result);
    })
  }, [toBeId])

  useEffect(() => {
    if(viewMode === 'detail'){
      db.getAllPlansByToBeId(toBeId)
      .then((result) => {
        setPlans(result);
      })
    }
  }, [viewMode])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if(viewMode === 'detail'){
          setViewMode('overview');
          return true
        } else {
          return false
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [viewMode])
  )

  const onAddNew = () => {
    setAddPlanMode(true);
  }

  if(toBeItem === undefined){
    return (
      <SafeAreaView style={styles.container}>
        <Text>Fetching from database</Text>
      </SafeAreaView>
    )
  } else if (viewMode === 'detail') {
    return (
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
          <PlanView toBeId={toBeId} />
          <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
            <Text>new</Text>
          </TouchableOpacity>
          <TextInput style={styles.input} onChangeText={(text) => setNewPlanTitle(text)} />
          <Button title={'add plan'} onPress={() => {
            db.addPlan(newPlanTitle, toBeId)
            .then((success) => {
              if(success){
                db.getAllPlansByToBeId(toBeId)
                .then((plans) => setPlans(plans))
              } else {
                Alert.alert("Unable to add a new plan at this time.");
              }
            });
          }} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: "50%",
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 20,
    color: 'white'
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