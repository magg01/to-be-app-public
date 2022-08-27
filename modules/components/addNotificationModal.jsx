import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, Modal, Button, Pressable, TextInput, Alert, Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as db from '../database/database';
import colors from '../utils/colors';


const MS_PER_MINUTE = 60000;

function AddNotificationModal({isVisible, onRequestClose, onDismiss, calEvent, repeater, updateCalEvent, updateRepeater}) {
  const [minutesBeforeStartTime, setMinutesBeforeStartTime] = useState('0');

  const addOneOffNotificationMinBeforeStartTime = async (minutesPriorToStart) => {
    // TODO: change this to use SchedulableNotificationTriggerInput with a DateTriggerInput - https://docs.expo.dev/versions/v46.0.0/sdk/notifications/#datetriggerinput
    const notificationTime = new Date(new Date(calEvent.eventstarttime).getTime()
      - MS_PER_MINUTE * minutesPriorToStart).getTime();
    const secondsToNotificationTime = Math.floor(
      // eslint-disable-next-line comma-dangle
      Math.abs((new Date().getTime() - notificationTime) / 1000)
    );

    const notificationID = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Be: ${calEvent.tobeitem_title}`,
        body: calEvent.plan_title,
      },
      trigger: {
        seconds: secondsToNotificationTime,
      },
    });
    db.addNotificationToCalEvent(calEvent.id, notificationID);
    updateCalEvent(await db.getCalEventWithPlanDetailsByCalEventId(calEvent.id));
  };

  const addRepeatingNotificationMinutesBeforeStartTime = async (minutesPriorToStart) => {
    // Alert.alert('add repeating notif here');
    const notificationTime = new Date(new Date(repeater.calstarttime).getTime()
      - MS_PER_MINUTE * minutesPriorToStart);

    let repeatingNotificationTrigger;
    if (Platform.OS === 'ios') {
      // ios repeating notification
      if (repeater.calday) {
        // weekly repeater
        repeatingNotificationTrigger = {
          repeats: true,
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          second: 0,
          weekday: repeater.calday + 1,
        };
      } else if (repeater.caldate) {
        // monthly repeater
        repeatingNotificationTrigger = {
          repeats: true,
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          second: 0,
          day: repeater.caldate,
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
    } else if (repeater.calday) {
      // weekly repeating
      repeatingNotificationTrigger = {
        repeats: true,
        weekday: repeater.calday + 1,
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
      };
    } else if (repeater.caldate) {
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
        title: `Be: ${repeater.tobeitem_title}`,
        body: repeater.plan_title,
      },
      trigger: repeatingNotificationTrigger,
    });
    db.addNotificationToRepeater(repeater.id, notificationID);
    updateRepeater(await db.getRepeaterEventWithPlanDetailsByRepeaterId(repeater.id));
  };

  const addNotification = () => {
    if (calEvent) {
      addOneOffNotificationMinBeforeStartTime(minutesBeforeStartTime);
    }
    if (repeater) {
      addRepeatingNotificationMinutesBeforeStartTime(minutesBeforeStartTime);
    }
  };

  const onClose = (shouldSetNotification) => {
    if (shouldSetNotification) {
      addNotification();
      onDismiss();
    } else {
      onDismiss();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      statusBarTranslucent
      visible={isVisible}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.titleText}>
            Add notification for {(calEvent ?? repeater).plan_title}
          </Text>
          <View style={styles.selectorRowContainer}>
            <Text style={styles.dateTimePickerHeader}>
              Minutes before start time:
            </Text>
            <TextInput
              style={styles.input}
              autoFocus
              showSoftInputOnFocus
              value={minutesBeforeStartTime}
              onChangeText={setMinutesBeforeStartTime}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => onClose(false)} />
            <Button title="Submit" onPress={() => onClose(true)} />
          </View>
          {/* <Button
            title="add"
            onPress={() => {
              addNotificationMinBeforeStartTime(minutesBeforeStartTime);
            }}
          />
          <Pressable
            onPress={() => onRequestClose()}
          > 
            <Text>Hide Modal</Text>
          </Pressable>*/}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(40,40,40,0.8)',
  },
  innerContainer: {
    backgroundColor: colors.general.defaultWhite,
    padding: 20,
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  titleText: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 12,
    color: colors.plans.textOrIconOnWhite,
  },
  buttonRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  selectorRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 3,
    marginBottom: 18,
  },
  dateTimePickerHeader: {
    color: colors.plans.textOrIconOnWhite,
    fontSize: 20,
    minWidth: '18%',
  },
  dateTimePickerDateTime: {
    color: colors.plans.textOrIconOnWhite,
    fontSize: 16,
    marginLeft: 20,
    flexGrow: 1,
  },
  input: {
    marginLeft: 12,
    fontSize: 24,
  },
});

export default AddNotificationModal;
