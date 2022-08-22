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
  ScrollView,
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
import PlanRepeaterView from '../components/planRepeaterView';
import colors from '../utils/colors';

const viewEnum = {
  overview: 0,
  details: 1,
  addPlan: 2,
};

function ViewToBeScreen({route, navigation}) {
  const [toBeId, setToBeId] = useState(undefined);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [viewMode, setViewMode] = useState(viewEnum.overview);
  const [tintColor, setTintColor] = useState('#ffffff');
  const [plansWithRepeaters, setPlansWithRepeaters] = useState(null);
  const [dailies, setDailies] = useState(null);
  const [weeklies, setWeeklies] = useState(null);
  const [monthlies, setMonthlies] = useState(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setToBeId(route.params.toBeId);
  }, [route.params.toBeId]);

  const refreshPlansAndRepeaters = useCallback(() => {
    if (toBeId !== undefined) {
      db.getAllPlansWithRepeatersByToBeId(toBeId)
        .then((result) => {
          setPlansWithRepeaters(result);
          setDailies(result.filter((item) => item.repeater_periodicity === 'daily'));
          setWeeklies(result.filter((item) => item.repeater_periodicity === 'weekly'));
          setMonthlies(result.filter((item) => item.repeater_periodicity === 'monthly'));
        });
    }
  }, [toBeId]);

  useEffect(() => {
    if (toBeItem !== undefined) {
      setTintColor(toBeItem.tintColor);
    }
  }, [toBeItem, tintColor]);

  useEffect(() => {
    refreshPlansAndRepeaters();
  }, [refreshPlansAndRepeaters, toBeId]);

  useEffect(() => {
    if (toBeId !== undefined) {
      db.getToBeItemById(toBeId)
        .then((result) => {
          setToBeItem(result);
        });
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
            <Feather style={{marginRight: 10}} name="edit-2" size={24} color={tintColor} onPress={() => Alert.alert("TODO: Implement edit mode here")} />
          </Animated.View>
        )
      ),
    });
  });

  const onNewPlanAdded = () => {
    setViewMode(viewEnum.details);
    refreshPlansAndRepeaters();
  };

  const onPlansModified = () => {
    refreshPlansAndRepeaters();
  };

  if (toBeItem === undefined) {
    return (
      <SafeAreaView style={styles.container(headerHeight, viewMode)}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  return (
    <ImageBackground source={{ uri: toBeItem.imageBackgroundUri }} resizeMode="cover" style={styles.backgroundImage}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container(headerHeight, viewMode)}>
          <Animated.Text
            style={styles.mainTitle(tintColor)}
            entering={animations.viewToBeScreen.mainTitleText.entering}
            layout={animations.viewToBeScreen.mainTitleText.layout}
          >
            {toBeItem.title}
          </Animated.Text>
          {viewMode === viewEnum.details
          && (
            <ScrollView
              nestedScrollEnabled
              style={{width: "100%"}}
            >
              <PlanView
                providedToBeId={toBeId}
                providedPlansWithRepeaters={plansWithRepeaters}
                onAddNewPressed={() => setViewMode(viewEnum.addPlan)}
                tintColor={tintColor}
                onPlansModified={onPlansModified}
              />
              {(dailies && dailies.length !== 0)
                && <PlanRepeaterView planRepeaters={dailies} tintColor={tintColor} repeaterType="daily" headerText="Dailies" />}
              {(weeklies && weeklies.length !== 0)
                && <PlanRepeaterView planRepeaters={weeklies} tintColor={tintColor} repeaterType="weekly" headerText="Weeklies" />}
              {(monthlies && monthlies.length !== 0)
                && <PlanRepeaterView planRepeaters={monthlies} tintColor={tintColor} repeaterType="monthly" headerText="Monthlies" />}
            </ScrollView>
          )}
          {viewMode === viewEnum.addPlan
          && (
            <AddPlan
              toBeId={toBeId}
              onAdd={onNewPlanAdded}
              toBeItemTitle={toBeItem.title}
              tintColor={tintColor}
            />
          )}
        </View>
        {viewMode === viewEnum.overview
          && (
          <Animated.View
            style={styles.bottomButtonContainer}
            entering={animations.viewToBeScreen.detailsButton.entering}
            exiting={animations.viewToBeScreen.detailsButton.exiting}
          >
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => setViewMode(viewEnum.details)}
            >
              <Text style={styles.bottomButtonText}>Details</Text>
            </TouchableOpacity>
          </Animated.View>
          )}
      </SafeAreaView>
      <StatusBar style="light" />
    </ImageBackground>
  );

  // TODO: reimplement as swipe action
  //        <Button title={"next"} onPress={() => {
  //           db.getNextToBeItemIdById(toBeId).then((result) => setToBeId(result))
  //         }}/>
  //         <Button title={"previous"} onPress={() => {
  //           db.getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result))
  //         }}/>
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: (headerHeight, viewMode) => (
    viewMode === viewEnum.overview
      ? {
        flex: 1,
        marginTop: headerHeight / 2,
        paddingHorizontal: '8%',
        alignItems: 'center',
        justifyContent: 'center',
      }
      : {
        flex: 1,
        marginTop: headerHeight / 2,
        paddingHorizontal: '8%',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }
  ),
  mainTitle: (tintColor) => ({
    fontSize: 36,
    marginBottom: 12,
    color: tintColor,
  }),
  bottomButtonContainer: {
    alignItems: 'center',
  },
  bottomButton: {
    margin: 10,
    opacity: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.general.defaultWhite,
    borderRadius: 14,
    width: 120,
    height: 40,
  },
  bottomButtonText: {
    fontSize: 16,
  },
});

export default ViewToBeScreen;
