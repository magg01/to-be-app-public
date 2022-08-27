import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { confirmRemoveNotification, cancelNotificationEvent, isScheduleNotificationAllowed } from '../utils/notifications';
import * as db from '../database/database';
import { zeroPadTime } from '../utils/datetime';
import AddNotificationModal from './addNotificationModal';
import colors from '../utils/colors';

const eventTypeEnum = {
  calEvent: 0,
  repeater: 1,
};

function CalEventItem({ appointment }) {
  const [calEventOrRepeater, setCalEventOrRepeater] = useState(undefined);
  const [calEventWithDetails, setCalEventWithDetails] = useState(undefined);
  const [repeaterEventWithDetails, setRepeaterEventWithDetails] = useState(undefined);
  const [eventDisplayStartTime, setEventDisplayStartTime] = useState(null);
  const [eventDisplayEndTime, setEventDisplayEndTime] = useState(null);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    if (appointment.calEventId !== null) {
      setCalEventOrRepeater(eventTypeEnum.calEvent);
    } else if (appointment.repeaterId !== null) {
      setCalEventOrRepeater(eventTypeEnum.repeater);
    }
  }, [appointment.calEventId, appointment.repeaterId]);

  useEffect(() => {
    if (calEventOrRepeater !== undefined) {
      if (calEventOrRepeater === eventTypeEnum.calEvent) {
        (async () => {
          setCalEventWithDetails(
            await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId),
          );
        })();
      }
      if (calEventOrRepeater === eventTypeEnum.repeater) {
        (async () => {
          setRepeaterEventWithDetails(
            await db.getRepeaterEventWithPlanDetailsByRepeaterId(appointment.repeaterId),
          );
        })();
      }
    }
  }, [appointment.calEventId, appointment.repeaterId, calEventOrRepeater]);

  useEffect(() => {
    if (calEventWithDetails !== undefined) {
      const eventStartTimeDate = new Date(calEventWithDetails.eventstarttime);
      const eventEndTimeDate = new Date(calEventWithDetails.eventendtime);
      setEventDisplayStartTime(`${zeroPadTime(eventStartTimeDate.getHours())}:${zeroPadTime(eventStartTimeDate.getMinutes())}`);
      setEventDisplayEndTime(`${zeroPadTime(eventEndTimeDate.getHours())}:${zeroPadTime(eventEndTimeDate.getMinutes())}`);
    }
  }, [calEventWithDetails]);

  useEffect(() => {
    if (repeaterEventWithDetails !== undefined) {
      const eventStartTimeDate = new Date(repeaterEventWithDetails.calstarttime);
      const eventEndTimeDate = new Date(repeaterEventWithDetails.calendtime);
      setEventDisplayStartTime(`${zeroPadTime(eventStartTimeDate.getHours())}:${zeroPadTime(eventStartTimeDate.getMinutes())}`);
      setEventDisplayEndTime(`${zeroPadTime(eventEndTimeDate.getHours())}:${zeroPadTime(eventEndTimeDate.getMinutes())}`);
    }
  }, [repeaterEventWithDetails]);

  const processOneOffNotificationRequest = async () => {
    // check if the calevent already has a notification identifier
    if (calEventWithDetails.eventnotification != null) {
      console.log(`present notification with identifier: ${calEventWithDetails.eventnotification}`);
      // ask if the currently set notification should be removed
      const shouldRemove = await confirmRemoveNotification();
      // if yes
      if (shouldRemove) {
        // delete the scheduled notification
        cancelNotificationEvent(calEventWithDetails.eventnotification);
        // remove the identifier from the database
        await db.removeNotificationFromCalEvent(calEventWithDetails.id);
        setCalEventWithDetails(
          await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId),
        );
      // if no
      } else {
        // do nothing
      }
      // check permissions, has the user granted permissions to send notifications?
      // if permissions granted
    } else if (await isScheduleNotificationAllowed()) {
      // show modal
      setNotificationModalVisible(true);
      // if permissions denied
    } else {
      // inform the user to update permissions if they want to use notifications
      Alert.alert('Notifications not allowed', 'You or your device settings have not allowed notifications to be scheduled. If you want to use the notification feature please enable notifications for this app in your device settings.');
    }
  };

  const processRepeatingNotificationRequest = async () => {
    // check if the repeating event already has a notification identifier
    if (repeaterEventWithDetails.notificationId != null) {
      console.log(`present notification with identifier: ${repeaterEventWithDetails.notificationId}`);
      // ask if the currently set notification should be removed
      const shouldRemove = await confirmRemoveNotification();
      // if yes
      if (shouldRemove) {
        // delete the scheduled notification
        cancelNotificationEvent(repeaterEventWithDetails.notificationId);
        // remove the identifier from the database
        await db.removeNotificationFromRepeaterByRepeaterId(repeaterEventWithDetails.id);
        setRepeaterEventWithDetails(
          await db.getRepeaterEventWithPlanDetailsByRepeaterId(appointment.repeaterId),
        );
      // if no
      } else {
        // do nothing
      }
      // check permissions, has the user granted permissions to send notifications?
      // if permissions granted
    } else if (await isScheduleNotificationAllowed()) {
      // show modal
      setNotificationModalVisible(true);
      // if permissions denied
    } else {
      // inform the user to update permissions if they want to use notifications
      Alert.alert('Notifications not allowed', 'You or your device settings have not allowed notifications to be scheduled. If you want to use the notification feature please enable notifications for this app in your device settings.');
    }
  };

  const onNotificationIconPressed = (event) => {
    // check if this is calEvent or repeaterEvent
    if (event === 'calEvent') {
      processOneOffNotificationRequest();
    }
    if (event === 'repeaterEvent') {
      processRepeatingNotificationRequest();
    }
  };

  if (calEventWithDetails === undefined && repeaterEventWithDetails === undefined) {
    return (
      <View style={[styles.item, { height: appointment.height, flexDirection: 'row' }]}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View style={[styles.item, { height: appointment.height, flexDirection: 'row' }]}>
      {calEventWithDetails
        && (
          <>
            <TouchableOpacity
            style={{ flexGrow: 1 }}
            onPress={() => Alert.alert(calEventWithDetails.plan_title)}
            >
              <Text style={styles.timing}>
                {eventDisplayStartTime} - {eventDisplayEndTime}
              </Text>
              <Text style={styles.name}>{calEventWithDetails.plan_title}</Text>
              <Text style={styles.type}>{`Be: ${calEventWithDetails.tobeitem_title}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => onNotificationIconPressed('calEvent')}>
              <Ionicons
                name={calEventWithDetails.eventnotification
                  ? 'notifications-outline'
                  : 'notifications-off-outline'}
                size={24}
                color={calEventWithDetails.eventnotification ? 'black' : 'lightgrey'}
              />
            </TouchableOpacity>
          </>
        )}
      {repeaterEventWithDetails
        && (
          <>
            <TouchableOpacity
              style={{ flexGrow: 1 }}
              onPress={() => Alert.alert(repeaterEventWithDetails.plan_title)}
            >
              <Text style={styles.timing}>
                {eventDisplayStartTime} - {eventDisplayEndTime}
              </Text>
              <Text style={styles.name}>{repeaterEventWithDetails.plan_title}</Text>
              <Text style={styles.type}>{`Be: ${repeaterEventWithDetails.tobeitem_title}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => onNotificationIconPressed('repeaterEvent')}>
              <Ionicons
                name={repeaterEventWithDetails.notificationId
                  ? 'notifications-outline'
                  : 'notifications-off-outline'}
                size={24}
                color={repeaterEventWithDetails.notificationId ? 'black' : 'lightgrey'}
              />
            </TouchableOpacity>
          </>
        )}
      <AddNotificationModal
        isVisible={notificationModalVisible}
        onRequestClose={() => setNotificationModalVisible(false)}
        onDismiss={() => setNotificationModalVisible(false)}
        calEvent={calEventWithDetails}
        updateCalEvent={(calEvent) => setCalEventWithDetails(calEvent)}
        repeater={repeaterEventWithDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.general.defaultWhite,
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
});

export default CalEventItem;
