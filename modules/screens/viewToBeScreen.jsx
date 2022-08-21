import React, {
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
} from 'react';
import {
  StyleSheet,
  Text,
  ImageBackground,
  View,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as db from '../database/database';
import PlanView from '../components/plans';
import AddPlan from '../components/addPlan';
import animations from '../utils/animations';
import DailiesView from '../components/dailies';

const viewEnum = {
  overview: 0,
  details: 1,
  addPlan: 2,
};

function ViewToBeScreen({route, navigation}) {
  const [toBeId, setToBeId] = useState(route.params.toBeId);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [viewMode, setViewMode] = useState(viewEnum.overview);
  const [tintColor, setTintColor] = useState('#ffffff');
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (toBeItem !== undefined) {
      setTintColor(toBeItem.tintColor);
    }
  }, [toBeItem, tintColor]);

  useEffect(() => {
    if (__DEV__) {
      let dev_delay_timer = setTimeout(() => {
        db.getToBeItemById(toBeId)
          .then((result) => {
            setToBeItem(result);
          });
      }, 1000);
      return (() => clearTimeout(dev_delay_timer));
    } else {
      db.getToBeItemById(toBeId)
      .then((result) => {
        setToBeItem(result);
      })
    }
  }, [toBeId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (viewMode === viewEnum.details) {
          setViewMode(viewEnum.overview);
          return true;
        }
        if (viewMode === viewEnum.addPlan) {
          setViewMode(viewEnum.details);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [viewMode]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton 
          onPress={() => {
            if (viewMode === viewEnum.addPlan){
              setViewMode(viewEnum.details)
            }
            else if(viewMode === viewEnum.details){
              setViewMode(viewEnum.overview)
            } else {
              navigation.goBack();
            }
          }} 
          tintColor={tintColor}
          labelVisible = {Platform.OS === 'ios' ? true : false}
        />
      ),
      headerRight: () => (
        viewMode === viewEnum.details 
        && (
          <Animated.View 
            entering={animations.viewToBeScreen.mainTitleText.entering}
            exiting={animations.viewToBeScreen.detailsButton.exiting}
          >
            <Feather style={{marginRight: 10}} name="edit-2" size={24} color={tintColor} onPress={() => Alert.alert("Implement edit mode here")} />
          </Animated.View>
        )
      ),
    });
  });

  const onNewPlanAdded = () => {
    setViewMode(viewEnum.details);
  };

  if (toBeItem === undefined) {
    return (
      <SafeAreaView style={[styles.container(headerHeight), {justifyContent:'center'}]}>
        <ActivityIndicator size={'large'}/>
      </SafeAreaView>
    );
  }
  return (
    <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.backgroundImage}>
      <SafeAreaView style={{flex: 1}}>
        <View style={[styles.container(headerHeight), viewMode === viewEnum.overview ? {justifyContent:'center'} : {justifyContent:'flex-start'}]}>
          <Animated.Text
            style={[styles.mainTitle, {color: tintColor}]}
            entering={animations.viewToBeScreen.mainTitleText.entering}
            layout={animations.viewToBeScreen.mainTitleText.layout}
          >
            {toBeItem.title}
          </Animated.Text>
          {viewMode === viewEnum.details ? (
            <>
              <PlanView providedToBeId={toBeId} onAddNewPressed={() => setViewMode(viewEnum.addPlan)} tintColor={tintColor}/>
              <DailiesView providedToBeId={toBeId} tintColor={tintColor} />
            </>
          )
            :
            viewMode === viewEnum.addPlan ?
              <AddPlan toBeId={toBeId} onAdd={onNewPlanAdded} toBeItemTitle={toBeItem.title} tintColor={tintColor}/>
              :
              null 
          }
        </View>
        <Animated.View
          style={{alignItems: 'center'}}
          entering={animations.viewToBeScreen.detailsButton.entering}
          exiting={animations.viewToBeScreen.detailsButton.exiting}
        >
          <TouchableOpacity style={styles.bottomButton} onPress={() => setViewMode(viewEnum.details)}>
            <Text style={{fontSize: 16}}>Details</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
      <StatusBar style="auto" />
    </ImageBackground>
  );
  // } else if (viewMode === viewEnum.details) {
  //   return (
  //     <ImageBackground source={{uri: toBeItem.imageBackgroundUri}} resizeMode="cover" style={styles.container}>
  //       <SafeAreaView style={styles.container}>
  //         <Text style={{color: 'white', fontSize: 36}}>{toBeItem.title}</Text>
  //         <PlanView toBeId={toBeId} />
  //         <TouchableOpacity style={styles.addButton} onPress={() => setViewMode(viewEnum.addPlan)}>
  //           <Text>new</Text>
  //         </TouchableOpacity>
  //       </SafeAreaView>
  //       <StatusBar style={'light'} />
  //     </ImageBackground>
  //   )
  // } else if (viewMode === viewEnum.addPlan) {
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
  //         <Button title={"details"} onPress={() => {setViewMode(viewEnum.details)}} />
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
  container: (headerHeight) => ({
    flex: 1,
    marginTop: headerHeight / 2,
    paddingHorizontal: "8%",
    alignItems: 'center',
  }),
  mainTitle: {
    fontSize: 36,
    marginBottom: 12,
  },
  bottomButton:{
    margin: 10,
    opacity: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 120,
    height: 40
  },
});

export default ViewToBeScreen;
