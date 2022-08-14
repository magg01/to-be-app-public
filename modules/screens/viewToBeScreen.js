import React, { useCallback, useEffect, useRef, useState, Fragment, useLayoutEffect  } from 'react';
import { StyleSheet, Text, ImageBackground, View, Button, Alert, BackHandler, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeIn, Layout, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import { StatusBar } from 'expo-status-bar'; 
import * as db from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { deleteLocallyStoredImage } from '../FileSystem/fileSystem';
import PlanView from '../components/plans';
import AddPlan from '../components/addPlan';
import { animations } from '../utils/animations';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
       return (
        <HeaderBackButton 
          onPress={() => {
            if (viewMode === 'addPlan'){
              setViewMode('detail')
            }
            else if(viewMode === 'detail'){
              setViewMode('overview')
            } else {
              navigation.goBack();
            }
          }} 
          tintColor='white'
          labelVisible = {Platform.OS === 'ios' ? true : false}
          //TODO: add label here for ios, "back" perhaps but didn't seem to be working
        />
       )
      }
    })
  })

  const onNewPlanAdded = () => {
    setViewMode('detail');
  }

  if(toBeItem === undefined){
    return (
      <SafeAreaView style={[styles.container, {justifyContent:'center'}]}>
        <ActivityIndicator size={'large'}/>
      </SafeAreaView>
    )
  } else {
    return (
      <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.backgroundImage}>
        <SafeAreaView style={{flex: 1}}>
          <View style={[styles.container, viewMode === 'overview' ? {justifyContent:'center'} : {justifyContent:'flex-start'}]}>
            <Animated.Text 
              style={styles.mainTitle}
              entering={animations.viewToBeScreen.mainTitleText.entering} 
              layout={animations.viewToBeScreen.mainTitleText.layout} 
            >{toBeItem.title}</Animated.Text>
            {viewMode === 'detail' ?
              <PlanView toBeId={toBeId} onAddNewPressed={() => setViewMode('addPlan')}/>
              :
              viewMode === 'addPlan' ?
                <AddPlan toBeId={toBeId} onAdd={onNewPlanAdded} toBeItemTitle={toBeItem.title} />
                :
                null 
            }
          </View>
          <Animated.View 
            entering={animations.viewToBeScreen.detailsButton.entering}
            exiting={animations.viewToBeScreen.detailsButton.exiting}
          >
            <TouchableOpacity style={styles.bottomButton} onPress={() => setViewMode('detail')}>
              <Text style={{fontSize: 16}}>Details</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    )
  }
  // } else if (viewMode === 'detail') {
  //   return (
  //     <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
  //       <SafeAreaView style={styles.container}>
  //         <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
  //         <PlanView toBeId={toBeId} />
  //         <TouchableOpacity style={styles.addButton} onPress={() => setViewMode('addPlan')}>
  //           <Text>new</Text>
  //         </TouchableOpacity>
  //       </SafeAreaView>
  //       <StatusBar style={'light'} />
  //     </ImageBackground>
  //   )
  // } else if (viewMode === 'addPlan') {
  //   return (
  //     <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
  //       <SafeAreaView style={styles.container}>
  //         <AddPlan toBeId={toBeId} onAddNewPlan={onNewPlanAdded} />
  //       </SafeAreaView>
  //       <StatusBar style={'light'} />
  //     </ImageBackground>
  //   )
  // } else {
  //   return(
  //     <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
  //       <SafeAreaView style={styles.container}>
  //         <Text style={{color: 'white', fontSize: 36, alignSelf: 'center'}}>{toBeItem.title}</Text>
  //         <Button title={"next"} onPress={() => {
  //           db.getNextToBeItemIdById(toBeId).then((result) => setToBeId(result))
  //         }}/>
  //         <Button title={"previous"} onPress={() => {
  //           db.getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result))
  //         }}/>
  //         <Button title={"details"} onPress={() => {setViewMode('detail')}} />
  //         <Button title={"delete"} onPress={() => {
  //           Alert.alert(
  //             'Are you sure?',
  //             'All associated data will be lost',
  //             [
  //               {
  //                 text: 'Cancel',
  //                 onPress: () => null,
  //                 style: 'cancel',
  //               },
  //               {
  //                 text: 'Delete',
  //                 onPress: () =>  {
  //                   db.deleteToBeItemById(toBeId)
  //                   .then((deleted) => {
  //                     if(deleted){
  //                       //TODO: implement check if this is the only use of the image before deleting (another tobe might be sharing this image filepath)
  //                       deleteLocallyStoredImage(toBeItem.imageBackgroundUri);
  //                       navigation.goBack(); 
  //                     } else {
  //                       Alert.alert("There was a problem deleting your to be. Please try again.");
  //                     }
  //                   })
  //                 },
  //                 style: 'destructive',
  //               },
  //             ],
  //             {
  //               cancelable: true,
  //             }
  //           );
  //         }} />
  //       </SafeAreaView>
  //       <StatusBar style={'light'} />
  //     </ImageBackground>
  //   )
  // }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: "8%",
  },
  mainTitle: {
    color: 'white', 
    fontSize: 36,
    alignSelf: 'center',
    marginBottom: 24
  },
  bottomButton:{
    margin: 10,
    opacity: 0.85,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 120,
    height: 40
  }
});