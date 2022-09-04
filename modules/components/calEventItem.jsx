/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert, Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import {
  confirmRemoveNotification, cancelNotificationEvent, isScheduleNotificationAllowed,
} from '../utils/notifications';
import * as db from '../database/database';
import AddNotificationModal from './addNotificationModal';
import { zeroPadTime, MS_PER_MINUTE } from '../utils/datetime';
import colors from '../utils/colors';
import { calEventTypeEnum } from '../utils/enums';

function CalEventItem({ eventItem, onEventModified }) {
  const [eventDisplayStartTime, setEventDisplayStartTime] = useState(null);
  const [eventDisplayEndTime, setEventDisplayEndTime] = useState(null);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [hasNotification, setHasNotification] = useState();

  useEffect(() => {
    setHasNotification(eventItem.notificationId !== null);
  }, [eventItem.notificationId]);

  useEffect(() => {
    const eventStartTimeDate = new Date(eventItem.startTime);
    const eventEndTimeDate = new Date(eventItem.endTime);
    setEventDisplayStartTime(`${zeroPadTime(eventStartTimeDate.getHours())}:${zeroPadTime(eventStartTimeDate.getMinutes())}`);
    setEventDisplayEndTime(`${zeroPadTime(eventEndTimeDate.getHours())}:${zeroPadTime(eventEndTimeDate.getMinutes())}`);
  }, [eventItem.startTime, eventItem.endTime]);

  const displayAndroidMonthlyNotificationUnsupportedAlert = () => {
    Alert.alert(
      'We\'re sorry.',
      'Unfortunately monthly repeating notifications are not currently supported on Android.',
    );
  };

  const checkNotificationsPermissions = async () => {
    // check permissions, has the user granted permissions to send notifications?
    // if permissions granted
    if (await isScheduleNotificationAllowed()) {
      return true;
    }
    // if permissions denied
    // inform the user to update permissions if they want to use notifications
    Alert.alert('Notifications not allowed', 'You or your device settings have not allowed notifications to be scheduled. If you want to use the notification feature please enable notifications for this app in your device settings.');
    return false;
  };

  const unscheduleAndRemoveNotification = async () => {
    // delete the scheduled notification
    cancelNotificationEvent(eventItem.notificationId);
    // remove the identifier from the database
    if (eventItem.type === calEventTypeEnum.singleEvent) {
      await db.removeNotificationFromCalEvent(eventItem.id);
    } else if (eventItem.type === calEventTypeEnum.repeaterEvent) {
      await db.removeNotificationFromRepeaterByRepeaterId(eventItem.id);
    }
  };

  const onNotificationIconPressed = async () => {
    // check if user is trying to add a monthly repeating notification on Android (unsupported)
    if (eventItem.periodicity === 'monthly' && Platform.OS === 'android') {
      displayAndroidMonthlyNotificationUnsupportedAlert();
      return;
    }
    // check if there is already a notification present
    if (hasNotification) {
      // check with user before removing the notification
      const shouldRemove = await confirmRemoveNotification();
      if (shouldRemove) {
        setHasNotification(false);
        unscheduleAndRemoveNotification()
          .then(() => onEventModified());
      }
    } else {
      // check permissions and show modal on granted.
      const notificationsAllowed = await checkNotificationsPermissions();
      if (notificationsAllowed) {
        // show the modal to get user input
        setNotificationModalVisible(true);
      }
    }
  };

  const onNotificationScheduled = async (notificationId) => {
    if (eventItem.type === calEventTypeEnum.singleEvent) {
      await db.addNotificationToCalEvent(eventItem.id, notificationId);
      onEventModified();
    }
    if (eventItem.type === calEventTypeEnum.repeaterEvent) {
      await db.addNotificationToRepeater(eventItem.id, notificationId);
      onEventModified();
    }
  };

  const addOneOffNotificationMinBeforeStartTime = async (minutesPriorToStart) => {
    const notificationTime = new Date(new Date(eventItem.startTime).getTime()
      - MS_PER_MINUTE * minutesPriorToStart).getTime();

    const notificationID = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Be: ${eventItem.toBeTitle}`,
        body: `${eventItem.planTitle} - ${eventDisplayStartTime}`,
      },
      trigger: notificationTime,
    });
    onNotificationScheduled(notificationID);
  };

  const addRepeatingNotificationMinutesBeforeStartTime = async (minutesPriorToStart) => {
    // Alert.alert('add repeating notif here');
    const notificationTime = new Date(new Date(eventItem.startTime).getTime()
      - MS_PER_MINUTE * minutesPriorToStart);

    let repeatingNotificationTrigger;
    if (Platform.OS === 'ios') {
      // ios repeating notification
      if (eventItem.calday) {
        // weekly repeater
        repeatingNotificationTrigger = {
          repeats: true,
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          second: 0,
          weekday: eventItem.calday + 1,
        };
      } else if (eventItem.caldate) {
        // monthly repeater
        repeatingNotificationTrigger = {
          repeats: true,
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          second: 0,
          day: eventItem.caldate,
        };
      } else {
        // daily repeater
        repeatingNotificationTrigger = {
          repeats: true,
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          second: 0,
        };
      }
    // android repeating notification
    } else if (eventItem.calday) {
      // weekly repeating
      repeatingNotificationTrigger = {
        repeats: true,
        weekday: eventItem.calday + 1,
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
      };
    } else if (eventItem.caldate) {
      // this shouldn't occur on Android and is handeled in CalEventItem component
    } else {
      // daily repeater
      repeatingNotificationTrigger = {
        repeats: true,
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
      };
    }
    const notificationID = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Be: ${eventItem.toBeTitle}`,
        body: `${eventItem.planTitle} - ${eventDisplayStartTime}`,
      },
      trigger: repeatingNotificationTrigger,
    });
    onNotificationScheduled(notificationID);
  };

  const addNotification = (minutesBeforeStartTime) => {
    if (eventItem.type === calEventTypeEnum.singleEvent) {
      addOneOffNotificationMinBeforeStartTime(minutesBeforeStartTime);
    }
    if (eventItem.type === calEventTypeEnum.repeaterEvent) {
      addRepeatingNotificationMinutesBeforeStartTime(minutesBeforeStartTime);
    }
  };

  return (
    <View style={[styles.item(eventItem.height)]}>
      <TouchableOpacity
        style={styles.itemMainTouchable}
        onPress={() => Alert.alert(eventItem.planTitle)}
      >
        <Text style={styles.timing}>
          {`${eventDisplayStartTime} - ${eventDisplayEndTime}`}
        </Text>
        <Text style={styles.name}>{eventItem.planTitle}</Text>
        <Text style={styles.type}>{`Be: ${eventItem.toBeTitle}`}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.notificationIconTouchable}
        onPress={() => onNotificationIconPressed()}
      >
        <Ionicons
          name={hasNotification
            ? 'notifications-outline'
            : 'notifications-off-outline'}
          size={24}
          color={hasNotification
            ? colors.plans.textOrIconOnWhite
            : colors.plans.disabledIcon}
        />
      </TouchableOpacity>
      <AddNotificationModal
        isVisible={notificationModalVisible}
        onRequestClose={() => setNotificationModalVisible(false)}
        onDismiss={() => setNotificationModalVisible(false)}
        eventItem={eventItem}
        onShouldSetNotification={
          (minutesBeforeStartTime) => addNotification(minutesBeforeStartTime)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: (eventItemHeight) => ({
    flex: 1,
    backgroundColor: colors.general.defaultWhite,
    height: eventItemHeight,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection: 'row',
  }),
  itemMainTouchable: {
    flexGrow: 1,
  },
  notificationIconTouchable: {
    alignSelf: 'center',
  },
});

export default CalEventItem;
