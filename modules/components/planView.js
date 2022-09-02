/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-filename-extension */
import React, {
  useEffect, useState,
} from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Dimensions,
} from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { deletePlanItemById } from '../database/database';
import animations from '../utils/animations';
import PlanItem from './planItem';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

const screenHeight = Dimensions.get('window').height;

function PlanView({
  providedPlansWithRepeaters, onAddNewPressed, tintColor, onPlansModified,
}) {
  const [expandedView, setExpandedView] = useState(true);
  const [plansWithRepeaters, setPlansWithRepeaters] = useState(undefined);

  useEffect(() => {
    setPlansWithRepeaters(providedPlansWithRepeaters);
  }, [providedPlansWithRepeaters]);

  const onDeletePlan = (planId) => {
    // still need to delete all scheduled notifications on calEvents before deleting plan.
    deletePlanItemById(planId)
      .then((deleted) => {
        if (deleted) {
          onPlansModified();
        } else {
          Alert.alert('Not deleted');
        }
      });
  };

  return (
    <Animated.View
      style={styles.container(tintColor)}
      entering={animations.plans.planView.entering()}
      exiting={animations.plans.planView.exiting()}
      layout={animations.plans.planView.layout()}
      testID="planView"
    >
      <View style={styles.headerContainer(tintColor)}>
        <Text style={styles.headerText(tintColor)}>{CONSTANT_STRINGS.PLANS.PLAN_VIEW.TITLE}</Text>
        <MaterialIcons
          name={expandedView ? 'expand-less' : 'expand-more'}
          size={22}
          color={tintColor}
          onPress={() => setExpandedView(!expandedView)}
          accessibilityLabel={CONSTANT_STRINGS.PLANS.PLAN_VIEW.EXPAND_COLLAPSE_ICON_LABEL}
        />
      </View>
      { expandedView
      && (
        <>
          <ScrollView
            nestedScrollEnabled
          >
            {plansWithRepeaters
              && plansWithRepeaters.map((item) => (
                <PlanItem
                  key={item.plan_id}
                  item={item}
                  onDelete={() => onDeletePlan(item.plan_id)}
                  onRepeaterModified={onPlansModified}
                />
              ))}
          </ScrollView>
          <Animated.View
            layout={animations.plans.planView.layout()}
            entering={animations.plans.planView.entering()}
            exiting={animations.plans.planView.exiting()}
          >
            <TouchableOpacity style={styles.addButton} onPress={() => onAddNewPressed()} accessibilityRole="button" >
              <Entypo name="add-to-list" size={18} color={colors.plans.textOrIconOnWhite} />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: (tintColor) => ({
    width: '100%',
    maxHeight: screenHeight * 0.65,
    borderWidth: 1.5,
    borderRadius: 6,
    padding: '3%',
    backgroundColor: colors.plans.planViewBackground,
    marginBottom: 12,
    borderColor: tintColor,
  }),
  headerContainer: (tintColor) => ({
    borderBottomWidth: 1.5,
    borderBottomColor: tintColor,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  }),
  headerText: (tintColor) => ({
    color: tintColor,
    fontSize: 20,
    flexGrow: 1,
  }),
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.general.defaultWhite,
  },
});

export default PlanView;
