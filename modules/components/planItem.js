/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert, TextInput, View} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addRepeater, deleteRepeater } from '../database/database';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import animations from '../utils/animations';
import colors from '../utils/colors';

const planLineContainerHeightCollapsed = 40;
const planLineContainerHeightExpanded = planLineContainerHeightCollapsed * 6;

function PlanItem({ item, onDelete, onRepeaterModified }) {
  const [showDetailView, setShowDetailView] = useState(false);
  const [hasDaily, setHasDaily] = useState(item.periodicity === 'daily');
  const [hasWeekly, setHasWeekly] = useState(item.periodicity === 'weekly');
  const [hasMonthly, setHasMonthly] = useState(item.periodicity === 'monthly');
  const [descriptionText, setDescriptionText] = useState('');

  const confirmDeletePlan = (planId) => {
    confirmDeleteAlert(
      'Delete this plan?',
      'Data and notifications for your plan will be removed',
      () => onDelete(planId),
      null,
    );
  };

  const onDailyPressed = () => {
    if (hasDaily) {
      deleteRepeater(item.id);
    } else {
      addRepeater({ periodicity: 'daily', endDate: null, planId: item.id });
    }
    setHasDaily(!hasDaily);
    onRepeaterModified('daily');
  };

  const onWeeklyPressed = () => {
    if (hasWeekly) {
      deleteRepeater(item.id);
    } else {
      addRepeater({ periodicity: 'weekly', endDate: null, planId: item.id });
    }
    setHasWeekly(!hasWeekly);
    onRepeaterModified('weekly');
  };

  const onMonthlyPressed = () => {
    if (hasMonthly) {
      deleteRepeater(item.id);
    } else {
      addRepeater({ periodicity: 'monthly', endDate: null, planId: item.id });
    }
    setHasMonthly(!hasMonthly);
    onRepeaterModified('monthly');
  };

  return (
    <Animated.View
      style={[styles.planLineContainer,
        showDetailView ? { height: planLineContainerHeightExpanded }
          : { height: planLineContainerHeightCollapsed },
      ]}
      entering={animations.plans.planItemForFlatList.entering}
      exiting={animations.plans.planItemForFlatList.exiting}
      layout={animations.plans.planItemForFlatList.layout}
    >
      <View
        style={showDetailView ? styles.planLineHeaderContainerExpanded : styles.planLineHeaderContainerCollapsed}
      >
        <TouchableOpacity
          style={styles.planLineHeader}
          key={item.id}
          onPress={() => Alert.alert(item.title)}
          onLongPress={() => confirmDeletePlan(item.id)}
        >
          <Text style={{ color: colors.plans.textOrIconOnWhite }}>{item.title}</Text>
        </TouchableOpacity>
        <MaterialIcons
          name={showDetailView ? "expand-less" : "expand-more"}
          size={22}
          color={colors.plans.textOrIconOnWhite}
          onPress={() => setShowDetailView(!showDetailView)}
        />
      </View>
      {showDetailView
        && (
          <Animated.View
            style={styles.planLineDetailContainer}
            entering={animations.plans.planItemForFlatList.entering}
            exiting={animations.plans.planItemForFlatList.exiting}
          >
            <TextInput
              style={{flex: 5, borderWidth: 1, borderColor: 'black', padding: 2}}
              placeholder={"Add more details here"}
              value={descriptionText}
              onChangeText={setDescriptionText}
              multiline
              textAlignVertical="top"
            />
            <View
              style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}
            >
              {(!hasDaily && !hasWeekly && !hasMonthly)
                && (
                  <>
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={24}
                      color={hasDaily ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                      onPress={onDailyPressed}
                    />
                    <MaterialCommunityIcons
                      name="calendar-week"
                      size={24}
                      color={hasWeekly ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                      onPress={onWeeklyPressed}
                    />
                    <MaterialCommunityIcons
                      name="calendar-today"
                      size={24}
                      color={hasMonthly ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                      onPress={onMonthlyPressed}
                    />
                  </>
                )}
              {hasDaily
                && (
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={24}
                    color={hasDaily ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                    onPress={onDailyPressed}
                  />
                )}
              {hasWeekly
                && (
                  <MaterialCommunityIcons
                    name="calendar-week"
                    size={24}
                    color={hasWeekly ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                    onPress={onWeeklyPressed}
                  />
                )}
              {hasMonthly
                && (
                  <MaterialCommunityIcons
                    name="calendar-today"
                    size={24}
                    color={hasMonthly ? colors.plans.textOrIconOnWhite : 'lightgrey'}
                    onPress={onMonthlyPressed}
                  />
                )}
            </View>
          </Animated.View>
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planLineContainer: {
    borderWidth: 1,
    borderColor: 'red',
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: 4,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.general.defaultWhite,
    opacity: 1,
  },
  planLineHeaderContainerCollapsed: {
    flex: 1, 
    borderWidth: 1,
    borderColor: 'green',
    flexDirection: 'row',
  },
  planLineHeaderContainerExpanded: {
    flex: 1, 
    borderWidth: 1,
    borderColor: 'green',
    flexDirection: 'row',
  },
  planLineHeader: {
    flex: 1,
    flexGrow: 1,
  },
  planLineDetailContainer: {
    flex: 8,
    borderWidth: 1,
    borderColor: 'purple',
    alignItems: 'stretch',
  },
});

export default PlanItem;
