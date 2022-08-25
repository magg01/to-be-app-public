/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Text, TextInput, View, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from './dateTimePicker';
import {
  addRepeater,
  deleteRepeaterByPlanId,
  updateEndDateTimeOnRepeaterByRepeaterId,
  updatePlanDescriptionByPlanId,
  deleteCalEventById,
  addCalEvent,
} from '../database/database';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import animations from '../utils/animations';
import colors from '../utils/colors';
import { getEndOfDay } from '../utils/datetime';
import CONSTANT_STRINGS from '../strings/constantStrings';

const planLineContainerHeightCollapsed = 40;
const planLineContainerHeightExpanded = planLineContainerHeightCollapsed * 6;
const iconSize = 28;

function PlanItem({ item, onDelete, onRepeaterModified }) {
  const [showDetailView, setShowDetailView] = useState(false);
  const [hasDaily, setHasDaily] = useState(false);
  const [hasWeekly, setHasWeekly] = useState(false);
  const [hasMonthly, setHasMonthly] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [hasCalEvent, setHasCalEvent] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [showEndDateDateTimePicker, setShowEndDateDateTimePicker] = useState(false);
  const [showCalEventDateTimePicker, setShowCalEventDateTimePicker] = useState(false);
  const endDate = useRef(null);

  useEffect(() => {
    setHasEndDate(item.repeater_enddate !== null);
  }, [item]);

  useEffect(() => {
    setHasCalEvent(item.calevent_id !== null);
  }, [item]);

  useEffect(() => {
    endDate.current = item.repeater_enddate;
  }, [item]);

  useEffect(() => {
    setDescriptionText(item.plan_description);
  }, [item]);

  useEffect(() => {
    setHasDaily(item.repeater_periodicity === 'daily');
    setHasWeekly(item.repeater_periodicity === 'weekly');
    setHasMonthly(item.repeater_periodicity === 'monthly');
  }, [item]);

  const confirmDeletePlan = (planId) => {
    confirmDeleteAlert(
      'Delete this plan?',
      'Data and notifications for your plan will be removed',
      () => onDelete(planId),
      null,
    );
  };

  const onDeleteCalEvent = (calEventId) => {
    deleteCalEventById(calEventId)
      .then(() => {
        onRepeaterModified();
      });
  };

  const confirmDeleteCalEvent = (calEventId) => {
    confirmDeleteAlert(
      'Remove from calendar?',
      'Any associated notifications will also be removed',
      () => onDeleteCalEvent(calEventId),
      null,
    );
  };

  const onDailyPressed = () => {
    if (hasDaily) {
      deleteRepeaterByPlanId(item.plan_id)
        .then(() => {
          onRepeaterModified();
        });
    } else {
      addRepeater({ periodicity: 'daily', endDate: null, planId: item.plan_id });
      onRepeaterModified();
    }
  };

  const onWeeklyPressed = () => {
    if (hasWeekly) {
      deleteRepeaterByPlanId(item.plan_id)
        .then(() => {
          onRepeaterModified();
        });
    } else {
      addRepeater({ periodicity: 'weekly', endDate: null, planId: item.plan_id })
        .then(() => {
          onRepeaterModified();
        });
    }
  };

  const onMonthlyPressed = () => {
    if (hasMonthly) {
      deleteRepeaterByPlanId(item.plan_id)
        .then(() => {
          onRepeaterModified();
        });
    } else {
      addRepeater({ periodicity: 'monthly', endDate: null, planId: item.plan_id })
        .then(() => {
          onRepeaterModified();
        });
    }
  };

  const onEndDatePressed = () => {
    if (hasEndDate) {
      updateEndDateTimeOnRepeaterByRepeaterId(item.repeater_id, null)
        .then(() => {
          onRepeaterModified();
        });
    } else {
      setShowEndDateDateTimePicker(true);
    }
  };

  const onCalendarPressed = () => {
    if (hasCalEvent) {
      confirmDeleteCalEvent(item.calevent_id);
    } else {
      // add cal event
      setShowCalEventDateTimePicker(true);
    }
  };

  const onUpdateEndDate = (date) => {
    setShowEndDateDateTimePicker(false);
    const endOfDay = getEndOfDay(date);
    updateEndDateTimeOnRepeaterByRepeaterId(item.repeater_id, endOfDay.toISOString())
      .then(() => {
        onRepeaterModified();
      });
  };

  const updatePlanDetailText = () => {
    updatePlanDescriptionByPlanId(item.plan_id, descriptionText);
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
        style={styles.planLineHeaderContainer}
      >
        <TouchableOpacity
          style={styles.planLineHeader}
          key={item.plan_id}
          onPress={() => setShowDetailView(!showDetailView)}
          onLongPress={() => confirmDeletePlan(item.plan_id)}
        >
          <Text style={styles.planLineTitleText}>{item.plan_title}</Text>
        </TouchableOpacity>
        <MaterialIcons
          name={showDetailView ? 'expand-less' : 'expand-more'}
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
              style={styles.descriptionTextInput}
              placeholder={CONSTANT_STRINGS.PLANS.PLAN_DETAIL_PLACEHOLDER}
              value={descriptionText}
              onChangeText={setDescriptionText}
              onEndEditing={updatePlanDetailText}
              multiline
              textAlignVertical="top"
            />
            <View
              style={[styles.detailIconsContainer, {borderColor: 'red', borderWidth: 1}]}
            >
              <MaterialCommunityIcons
                style={[styles.repeaterIcon, {flexGrow: 1}]}
                name={
                  hasCalEvent
                    ? 'calendar-minus'
                    : 'calendar-plus'
                }
                size={iconSize}
                color={
                  hasCalEvent
                    ? colors.plans.textOrIconOnWhite
                    : colors.general.unactivatedIcon
                }
                onPress={onCalendarPressed}
              />
              {(!hasWeekly && !hasMonthly)
                && (
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering}
                    exiting={animations.plans.planItemForFlatList.exiting}
                    layout={animations.plans.planItemForFlatList.layout}
                  >
                    <MaterialCommunityIcons
                      style={styles.repeaterIcon}
                      name="calendar-month"
                      size={iconSize}
                      color={
                        hasDaily
                          ? colors.plans.textOrIconOnWhite
                          : colors.general.unactivatedIcon
                        }
                      onPress={onDailyPressed}
                    />
                  </Animated.View>
                )}
              {(!hasDaily && !hasMonthly)
                && (
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering}
                    exiting={animations.plans.planItemForFlatList.exiting}
                    layout={animations.plans.planItemForFlatList.layout}
                  >
                    <MaterialCommunityIcons
                      style={styles.repeaterIcon}
                      name="calendar-week"
                      size={iconSize}
                      color={
                        hasWeekly
                          ? colors.plans.textOrIconOnWhite
                          : colors.general.unactivatedIcon
                        }
                      onPress={onWeeklyPressed}
                    />
                  </Animated.View>
                )}
              {(!hasDaily && !hasWeekly)
                && (
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering}
                    exiting={animations.plans.planItemForFlatList.exiting}
                    layout={animations.plans.planItemForFlatList.layout}
                  >
                    <MaterialCommunityIcons
                      style={styles.repeaterIcon}
                      name="calendar-today"
                      size={iconSize}
                      color={
                        hasMonthly
                          ? colors.plans.textOrIconOnWhite
                          : colors.general.unactivatedIcon
                        }
                      onPress={onMonthlyPressed}
                    />
                  </Animated.View>
                )}
              {(hasDaily || hasWeekly || hasMonthly)
                && (
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering}
                    exiting={animations.plans.planItemForFlatList.exiting}
                    layout={animations.plans.planItemForFlatList.layout}
                  >
                    <MaterialCommunityIcons
                      style={styles.repeaterIcon}
                      name="calendar-end"
                      size={iconSize}
                      color={
                        hasEndDate
                          ? colors.plans.textOrIconOnWhite
                          : colors.plans.disabledIcon
                        }
                      onPress={() => onEndDatePressed()}
                    />
                  </Animated.View>
                )}
            </View>
          </Animated.View>
        )}
      {showEndDateDateTimePicker
        && (
          <DateTimePicker
            modalTitleText={CONSTANT_STRINGS.PLANS.REPEATERS.SET_END_DATE_PROMPT}
            dateOnly
            dateValue={endDate}
            onSubmit={
              ({ date }) => onUpdateEndDate(date)
            }
            returnToScreenName="ViewToBeScreen"
            onCancel={() => setShowEndDateDateTimePicker(false)}
          />
        )}
      {showCalEventDateTimePicker
        && (
          <DateTimePicker
            modalTitleText={CONSTANT_STRINGS.PLANS.ADD_CAL_EVENT_DATETIMEPICKER_HEADER}
            onSubmit={({ date, startTime, endTime }) => {
              addCalEvent(
                date.toISOString(),
                startTime.toISOString(),
                endTime.toISOString(),
                item.plan_id,
              );
              setShowCalEventDateTimePicker(false);
              onRepeaterModified();
            }}
            onCancel={() => {
              setShowCalEventDateTimePicker(false);
            }}
          />
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planLineContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: 4,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: colors.general.defaultWhite,
  },
  planLineHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  planLineHeader: {
    flex: 1,
    flexGrow: 1,
  },
  planLineDetailContainer: {
    flex: 8,
    alignItems: 'stretch',
  },
  descriptionTextInput: {
    flex: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.plans.textOrIconOnWhite,
    padding: 4,
    marginVertical: 6,
  },
  repeaterIcon: {
    marginRight: 4,
  },
  detailIconsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  planLineTitleText: {
    fontSize: 16,
    color: colors.plans.textOrIconOnWhite,
  },
});

export default PlanItem;
