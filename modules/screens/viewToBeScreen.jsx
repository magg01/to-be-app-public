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
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as db from '../database/database';
import PlanView from '../components/planView';
import AddPlan from '../components/addPlan';
import animations from '../utils/animations';
import PlanRepeaterView from '../components/planRepeaterView';
import colors from '../utils/colors';
import { hasEndDateElapsed } from '../utils/datetime';
import CONSTANT_STRINGS from '../strings/constantStrings';
import { viewToBeScreenViewEnum } from '../utils/enums';

const defaultBackgroundImage = require('../../assets/addNew.jpg');

function ViewToBeScreen({route, navigation}) {
  const [toBeId, setToBeId] = useState(undefined);
  const [toBeItem, setToBeItem] = useState(undefined);
  const [viewMode, setViewMode] = useState(viewToBeScreenViewEnum.overview);
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
          // put any non-repeating plans and repeaters whose end date has elapsed in the plan view
          setPlansWithRepeaters(
            result.filter((item) => (
              item.repeater_periodicity === null || hasEndDateElapsed(item.repeater_enddate)
            )),
          );
          // let through those repeaters that either have no end date
          // or their end date is not in the past
          setDailies(result.filter((item) => (
            item.repeater_periodicity === 'daily' && !hasEndDateElapsed(item.repeater_enddate)
          )));
          setWeeklies(result.filter((item) => (
            item.repeater_periodicity === 'weekly' && !hasEndDateElapsed(item.repeater_enddate)
          )));
          setMonthlies(result.filter((item) => (
            item.repeater_periodicity === 'monthly' && !hasEndDateElapsed(item.repeater_enddate)
          )));
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
        if (viewMode === viewToBeScreenViewEnum.details) {
          setViewMode(viewToBeScreenViewEnum.overview);
          return true;
        }
        if (viewMode === viewToBeScreenViewEnum.addPlan) {
          setViewMode(viewToBeScreenViewEnum.details);
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
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => {
            if (viewMode === viewToBeScreenViewEnum.addPlan) {
              setViewMode(viewToBeScreenViewEnum.details);
            } else if (viewMode === viewToBeScreenViewEnum.details) {
              setViewMode(viewToBeScreenViewEnum.overview);
            } else {
              navigation.goBack();
            }
          }}
          tintColor={tintColor}
          labelVisible={Platform.OS === 'ios'}
        />
      ),
      // ToDo: implement edit mode here
      // headerRight: () => (
      //   viewMode === viewEnum.details
      //   && (
      //     <Animated.View
      //       entering={animations.viewToBeScreen.mainTitleText.entering()}
      //       exiting={animations.viewToBeScreen.detailsButton.exiting()}
      //     >
      //       <Feather
      //          style={{marginRight: 10}}
      //          name="edit-2"
      //          size={24}
      //          color={tintColor}
      //          onPress={null}
      //       />
      //     </Animated.View>
      //   )
      // ),
    });
  });

  const onNewPlanAdded = () => {
    setViewMode(viewToBeScreenViewEnum.details);
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
    <ImageBackground
      source={{ uri: toBeItem.imageBackgroundUri }}
      resizeMode="cover"
      style={styles.backgroundImage}
      defaultSource={defaultBackgroundImage}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container(headerHeight, viewMode)}>
          <Animated.Text
            style={styles.mainTitle(tintColor)}
            entering={animations.viewToBeScreen.mainTitleText.entering()}
            layout={animations.viewToBeScreen.mainTitleText.layout()}
          >
            {toBeItem.title}
          </Animated.Text>
          {viewMode === viewToBeScreenViewEnum.details
          && (
            <ScrollView
              nestedScrollEnabled
              style={styles.scrollViewOuterContainer}
              contentContainerStyle={styles.scrollViewContentContainer}
            >
              <PlanView
                providedPlansWithRepeaters={plansWithRepeaters}
                onAddNewPressed={() => setViewMode(viewToBeScreenViewEnum.addPlan)}
                tintColor={tintColor}
                onPlansModified={onPlansModified}
              />
              {(dailies && dailies.length !== 0)
                && (
                  <PlanRepeaterView
                    planRepeaters={dailies}
                    tintColor={tintColor}
                    headerText={CONSTANT_STRINGS.PLANS.REPEATERS.HEADER_TEXT_DAILIES}
                    onRepeaterModified={onPlansModified}
                  />
                )}
              {(weeklies && weeklies.length !== 0)
                && (
                  <PlanRepeaterView
                    planRepeaters={weeklies}
                    tintColor={tintColor}
                    headerText={CONSTANT_STRINGS.PLANS.REPEATERS.HEADER_TEXT_WEEKLIES}
                    onRepeaterModified={onPlansModified}
                  />
                )}
              {(monthlies && monthlies.length !== 0)
                && (
                  <PlanRepeaterView
                    planRepeaters={monthlies}
                    tintColor={tintColor}
                    headerText={CONSTANT_STRINGS.PLANS.REPEATERS.HEADER_TEXT_MONTHLIES}
                    onRepeaterModified={onPlansModified}
                  />
                )}
            </ScrollView>
          )}
          {viewMode === viewToBeScreenViewEnum.addPlan
            && (
              <AddPlan
                toBeId={toBeId}
                onAdd={onNewPlanAdded}
                toBeItemTitle={toBeItem.title}
                tintColor={tintColor}
              />
            )}
        </View>
        {viewMode === viewToBeScreenViewEnum.overview
          && (
          <Animated.View
            style={styles.bottomButtonContainer}
            entering={animations.viewToBeScreen.detailsButton.entering()}
            exiting={animations.viewToBeScreen.detailsButton.exiting()}
          >
            {/* TODO: reimplement as swipe action */}
            <MaterialCommunityIcons
              style={styles.directionChevrons}
              name="chevron-double-left"
              size={24}
              color={tintColor}
              onPress={() => {
                db.getPreviousToBeItemIdById(toBeId).then((result) => setToBeId(result));
              }}
            />
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => setViewMode(viewToBeScreenViewEnum.details)}
            >
              <Text style={styles.bottomButtonText}>Details</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons
              style={styles.directionChevrons}
              name="chevron-double-right"
              size={24}
              color={tintColor}
              onPress={() => {
                db.getNextToBeItemIdById(toBeId).then((result) => setToBeId(result));
              }}
            />
          </Animated.View>
          )}
      </SafeAreaView>
      <StatusBar style="light" />
    </ImageBackground>
  );
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
    viewMode === viewToBeScreenViewEnum.overview
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
  scrollViewOuterContainer: {
    width: '100%',
  },
  scrollViewContentContainer: {
    flexGrow: 1,
  },
  bottomButtonContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomButton: {
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.general.defaultWhite,
    borderRadius: 8,
  },
  bottomButtonText: {
    fontSize: 16,
  },
  directionChevrons: {
    opacity: 0.7,
  },
});

export default ViewToBeScreen;
