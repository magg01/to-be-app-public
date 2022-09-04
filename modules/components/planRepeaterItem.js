/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import animations from '../utils/animations';
import colors from '../utils/colors';
import confirmDeleteAlert from '../utils/deleteConfirmation';
import { getPreviousPeriodReset, getEndOfDay } from '../utils/datetime';
import DateTimePicker from './dateTimePicker';
import {
  updateLastDoneDateTimeOnRepeaterByRepeaterId,
  deleteRepeaterByPlanId,
  updatePlanDescriptionByPlanId,
  updateEndDateTimeOnRepeaterByRepeaterId,
  udpateRepeaterCalEvent,
} from '../database/database';
import CONSTANT_STRINGS from '../strings/constantStrings';
import RepeaterCalEventDateTimePicker from './repeaterCalEventDateTimePicker';
import { cancelNotificationEvent } from '../utils/notifications';

const planLineContainerHeightCollapsed = 40;
const planLineContainerHeightExpanded = planLineContainerHeightCollapsed * 6;
const iconSize = 28;

function PlanRepeaterItem({ item, onRepeaterModified }) {
  const [isDoneForNow, setIsDoneForNow] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [hasRepeatingCalEvent, setHasRepeatingCalEvent] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [showEndDateDateTimePicker, setShowEndDateDateTimePicker] = useState(false);
  const [showRepeatingCalEventDateTimePicker,
    setShowRepeatingCalEventDateTimePicker] = useState(false);

  useEffect(() => {
    setHasRepeatingCalEvent(item.repeater_shouldshowincalendar);
  }, [item]);

  useEffect(() => {
    setHasEndDate(item.repeater_enddate !== null);
  }, [item]);

  useEffect(() => {
    setDescriptionText(item.plan_description);
  }, [item]);

  useEffect(() => {
    // if the repeaterItem has no lastdonedatetime then it is not complete
    if (item.repeater_lastdonedatetime === null) {
      setIsDoneForNow(false);
    // if the repeaterItem has a lastdonedatetime
    } else {
      // find out the previous reset datetime from now
      const previousPeriodReset = getPreviousPeriodReset(item.repeater_periodicity);
      // check if the lastdonedatetime is >= the previous period reset
      if (new Date(item.repeater_lastdonedatetime) >= previousPeriodReset) {
        // then it is done for now
        setIsDoneForNow(true);
      } else {
        // if it is < the previous period reset
        // then it needs doing again
        setIsDoneForNow(false);
      }
    }
  }, [item.repeater_lastdonedatetime, item.repeater_periodicity]);

  const confirmDeleteThisRepeaterItem = () => {
    confirmDeleteAlert(
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_MAIN_TITLE,
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_DESCRIPTION,
      () => {
        if (item.repeater_notificationId) {
          cancelNotificationEvent(item.repeater_notificationId);
        }
        deleteRepeaterByPlanId(item.plan_id)
          .then(() => {
            onRepeaterModified();
          });
      },
      () => null,
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_CONFIRM_BUTTON_TITLE,
    );
  };

  const updateIsDoneForNow = () => {
    if (isDoneForNow) {
      setIsDoneForNow(!isDoneForNow);
      updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, null)
        .then((updated) => {
          if (updated) onRepeaterModified();
        });
    } else {
      setIsDoneForNow(!isDoneForNow);
      updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, (new Date()).toISOString())
        .then((updated) => {
          if (updated) onRepeaterModified();
        });
      Toast.show({
        type: 'info',
        text1: CONSTANT_STRINGS.PLANS.REPEATERS.COMPLETION_TOAST_HEADER(),
        text2: CONSTANT_STRINGS.PLANS.REPEATERS.COMPLETION_TOAST_CONTENT(item.repeater_periodicity),
      });
    }
  };

  const updatePlanDetailText = () => {
    updatePlanDescriptionByPlanId(item.plan_id, descriptionText);
  };

  const onRepeatCalendarIconPressed = () => {
    if (hasRepeatingCalEvent) {
      // confirmDeleteCalEvent(item.calevent_id);
      confirmDeleteAlert(
        'Are you sure you want to delete your repeating calendar event?',
        'Any notifications will also be deleted',
        () => {
          udpateRepeaterCalEvent(item.repeater_id, null, null, null, null, 0)
            .then((deleted) => {
              if (deleted) onRepeaterModified();
            });
        },
        null,
        'Delete',
      );
    } else {
      setShowRepeatingCalEventDateTimePicker(true);
    }
  };

  const getIconNameForRepeaterIcon = () => {
    if (item.repeater_periodicity === 'daily') {
      return 'calendar-month';
    }
    if (item.repeater_periodicity === 'weekly') {
      return 'calendar-week';
    }
    if (item.repeater_periodicity === 'monthly') {
      return 'calendar-today';
    }
  };

  const onRepeaterIconPressed = () => {
    deleteRepeaterByPlanId(item.plan_id)
      .then(() => {
        onRepeaterModified();
      });
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

  const onUpdateEndDate = (date) => {
    setShowEndDateDateTimePicker(false);
    const endOfDay = getEndOfDay(date);
    updateEndDateTimeOnRepeaterByRepeaterId(item.repeater_id, endOfDay.toISOString())
      .then(() => {
        onRepeaterModified();
      });
  };

  const getModalTitleTextForRepeatingEventPicker = () => {
    if (item.repeater_periodicity === 'daily') { return 'Choose the start and end time of your repeating event'; }
    if (item.repeater_periodicity === 'weekly') { return 'Choose the day of the week and times for your repeating event'; }
    if (item.repeater_periodicity === 'monthly') { return 'Choose the day of the month and times for your repeating event'; }
  };

  const setRepeatingCalendarEventOnRepeater = (dateTimeData) => {
    if (item.repeater_periodicity === 'daily') {
      // eslint-disable-next-line max-len
      udpateRepeaterCalEvent(item.repeater_id, dateTimeData.startTime.toISOString(), dateTimeData.endTime.toISOString(), null, null, 1)
        .then((updated) => (updated ? onRepeaterModified() : null));
    } else if (item.repeater_periodicity === 'weekly') {
      // eslint-disable-next-line max-len
      udpateRepeaterCalEvent(item.repeater_id, dateTimeData.startTime.toISOString(), dateTimeData.endTime.toISOString(), dateTimeData.dayOfWeek, null, 1)
        .then((updated) => (updated ? onRepeaterModified() : null));
    } else if (item.repeater_periodicity === 'monthly') {
      // eslint-disable-next-line max-len
      udpateRepeaterCalEvent(item.repeater_id, dateTimeData.startTime.toISOString(), dateTimeData.endTime.toISOString(), null, dateTimeData.dayOfMonth, 1)
        .then((updated) => (updated ? onRepeaterModified() : null));
    }
    setShowRepeatingCalEventDateTimePicker(false);
  };

  return (
    // unfortunately the opacity based on state does not work on an animated view,
    // at least not on initial render, so we need this outer container to
    // dynamically set the opacity based on state from first render on.
    <View style={styles.opacityOverlay(isDoneForNow)}>
      <Animated.View
        style={[styles.planLineContainer,
          showDetailView ? { height: planLineContainerHeightExpanded }
            : { height: planLineContainerHeightCollapsed },
        ]}
        entering={animations.plans.planItemForFlatList.entering()}
        exiting={animations.plans.planItemForFlatList.exiting()}
        layout={animations.plans.planItemForFlatList.layout()}
      >
        <View
          style={styles.planLineHeaderContainer}
        >
          <TouchableOpacity
            style={styles.planLineHeader}
            key={item.repeater_id}
            onPress={updateIsDoneForNow}
            onLongPress={confirmDeleteThisRepeaterItem}
          >
            <MaterialCommunityIcons
              name={
                isDoneForNow
                  ? 'checkbox-marked-outline'
                  : 'checkbox-blank-outline'
              }
              size={22}
              color={colors.plans.textOrIconOnWhite}
            />
            <Text style={styles.planLineTitleText(isDoneForNow)}>{item.plan_title}</Text>
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
              entering={animations.plans.planItemForFlatList.entering()}
              exiting={animations.plans.planItemForFlatList.exiting()}
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
                style={styles.detailIconsContainer}
              >
                <View style={styles.detailIconsLeft}>
                  <MaterialCommunityIcons
                    style={styles.repeaterIcon}
                    name="calendar-refresh"
                    size={iconSize}
                    color={
                      hasRepeatingCalEvent
                        ? colors.plans.textOrIconOnWhite
                        : colors.general.unactivatedIcon
                    }
                    onPress={onRepeatCalendarIconPressed}
                  />
                </View>
                <View style={styles.detailIconsRight}>
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering()}
                    exiting={animations.plans.planItemForFlatList.exiting()}
                    layout={animations.plans.planItemForFlatList.layout()}
                  >
                    <MaterialCommunityIcons
                      style={styles.repeaterIcon}
                      name={getIconNameForRepeaterIcon()}
                      size={iconSize}
                      color={colors.plans.textOrIconOnWhite}
                      onPress={onRepeaterIconPressed}
                    />
                  </Animated.View>
                  <Animated.View
                    entering={animations.plans.planItemForFlatList.entering()}
                    exiting={animations.plans.planItemForFlatList.exiting()}
                    layout={animations.plans.planItemForFlatList.layout()}
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
                </View>
              </View>
            </Animated.View>
          )}
        {showEndDateDateTimePicker
          && (
            <DateTimePicker
              modalTitleText={CONSTANT_STRINGS.PLANS.REPEATERS.SET_END_DATE_PROMPT}
              dateOnly
              onSubmit={
                ({ date }) => onUpdateEndDate(date)
              }
              returnToScreenName="ViewToBeScreen"
              onCancel={() => setShowEndDateDateTimePicker(false)}
            />
          )}
        {showRepeatingCalEventDateTimePicker
          && (
            <RepeaterCalEventDateTimePicker
              modalTitleText={getModalTitleTextForRepeatingEventPicker()}
              periodicity={item.repeater_periodicity}
              onSubmit={(dateTimeData) => setRepeatingCalendarEventOnRepeater(dateTimeData)}
              onCancel={() => setShowRepeatingCalEventDateTimePicker(false)}
            />
          )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  opacityOverlay: (isDoneForNow) => ({
    opacity: isDoneForNow ? 0.3 : 1,
  }),
  planLineContainer: {
    flex: 1,
    width: '100%',
    height: planLineContainerHeightCollapsed,
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
    flexDirection: 'row',
  },
  planLineDetailContainer: {
    flex: 8,
    alignItems: 'stretch',
  },
  planLineTitleText: (isDoneForNow) => ({
    fontSize: 16,
    marginLeft: 6,
    color: colors.plans.textOrIconOnWhite,
    textDecorationLine: isDoneForNow ? 'line-through' : null,
  }),
  descriptionTextInput: {
    flex: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.plans.textOrIconOnWhite,
    padding: 4,
    marginVertical: 6,
    marginLeft: 3,
    marginRight: 6,
  },
  detailIconsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  detailIconsLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  detailIconsRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  repeaterIcon: {
    marginRight: 4,
  },
});

export default PlanRepeaterItem;
