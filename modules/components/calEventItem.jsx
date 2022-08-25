import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert, Modal, Button, Pressable, ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { confirmRemoveNotification, cancelNotificationEvent, isScheduleNotificationAllowed } from '../utils/notifications';
import * as db from '../database/database';

function CalEventItem({ appointment }) {
  const [calEventWithDetails, setCalEventWithDetails] = useState(undefined);
  const [eventDisplayStartTime, setEventDisplayStartTime] = useState(null);
  const [eventDisplayEndTime, setEventDisplayEndTime] = useState(null);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      setCalEventWithDetails(
        await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId)
      );
    })();
  }, [appointment.calEventId]);

  const zeroPadTime = (time) => {
    // would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
    // could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go. 
    if (time < 10) {
      return `0${time}`;
    }
    return time;
  };

  useEffect(() => {
    if (calEventWithDetails !== undefined) {
      const eventStartTimeDate = new Date(calEventWithDetails.eventstarttime);
      const eventEndTimeDate = new Date(calEventWithDetails.eventendtime);
      setEventDisplayStartTime(`${zeroPadTime(eventStartTimeDate.getHours())}:${zeroPadTime(eventStartTimeDate.getMinutes())}`);
      setEventDisplayEndTime(`${zeroPadTime(eventEndTimeDate.getHours())}:${zeroPadTime(eventEndTimeDate.getMinutes())}`);
    }
  }, [calEventWithDetails]);

  const onNotificationIconPressed = async () => {
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
          // eslint-disable-next-line comma-dangle
          await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId)
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

  const addNotificationMinBeforeStartTime = async (minutesPriorToStart) => {
    // currently a hack work-around for setting exact times in trigger which needs
    // special permissions is to calculate the number of seconds
    // between the requested notification time and now and apply that to trigger.
    // If the notification time is in the past it will trigger in the future by
    // the number of seconds between the two - which is a bug.

    // change this to use SchedulableNotificationTriggerInput with a DateTriggerInput - https://docs.expo.dev/versions/v46.0.0/sdk/notifications/#datetriggerinput
    const MS_PER_MINUTE = 60000;
    const notificationTime = new Date(new Date(calEventWithDetails.eventstarttime).getTime()
      - MS_PER_MINUTE * minutesPriorToStart).getTime();
    const secondsTONotificationTime = Math.floor(
      // eslint-disable-next-line comma-dangle
      Math.abs((new Date().getTime() - notificationTime) / 1000)
    );

    const notificationID = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Be: ${calEventWithDetails.tobeitem_title}`,
        body: calEventWithDetails.plan_title,
      },
      trigger: {
        seconds: secondsTONotificationTime,
      },
    });
    await db.addNotificationToCalEvent(calEventWithDetails.id, notificationID);
    setCalEventWithDetails(await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId));
  };

  if (calEventWithDetails === undefined) {
    return (
      <View style={[styles.item, { height: appointment.height, flexDirection: 'row' }]}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View style={[styles.item, { height: appointment.height, flexDirection: 'row' }]}>
      <TouchableOpacity
        style={{ flexGrow: 1}}
        onPress={() => Alert.alert(calEventWithDetails.plan_title)}
      >
        <Text style={styles.timing}>
          {eventDisplayStartTime} - {eventDisplayEndTime}
        </Text>
        <Text style={styles.name}>{calEventWithDetails.plan_title}</Text>
        <Text style={styles.type}>{`Be: ${calEventWithDetails.tobeitem_title}`}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{alignSelf: 'center', }} onPress={() => onNotificationIconPressed()}>
        <Ionicons name="notifications-outline" size={24} color={calEventWithDetails.eventnotification != null ? "black" : "lightgrey" } />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent
        visible={notificationModalVisible}
        onRequestClose={() => {
          setNotificationModalVisible(false);
        }}
        onDismiss={() => {
          setNotificationModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>
              Add notification for{calEventWithDetails.plan_title}
            </Text>
            <Button
              title="30 minutes before"
              onPress={() => {
                addNotificationMinBeforeStartTime(30);
              }}
            />
            <Button
              title="At the time"
              onPress={() => {
                addNotificationMinBeforeStartTime(0);
              }}
            />
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setNotificationModalVisible(!notificationModalVisible)}
            >
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
});

export default CalEventItem;
