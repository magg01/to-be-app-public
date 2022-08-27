import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, Modal, Button, Pressable, TextInput, Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as db from '../database/database';
import colors from '../utils/colors';

function AddNotificationModal({isVisible, onRequestClose, onDismiss, calEvent, repeater, updateCalEvent}) {
  const [minutesBeforeStartTime, setMinutesBeforeStartTime] = useState('0');

  const addOneOffNotificationMinBeforeStartTime = async (minutesPriorToStart) => {
    // TODO: change this to use SchedulableNotificationTriggerInput with a DateTriggerInput - https://docs.expo.dev/versions/v46.0.0/sdk/notifications/#datetriggerinput
    const MS_PER_MINUTE = 60000;
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
    Alert.alert('add repeating notif here');
  };

  const addNotificationMinBeforeStartTime = () => {
    if (calEvent) {
      addOneOffNotificationMinBeforeStartTime(minutesBeforeStartTime);
    }
    if (repeater) {
      addRepeatingNotificationMinutesBeforeStartTime(minutesBeforeStartTime);
    }
  };

  const onClose = (shouldSetNotification) => {
    if (shouldSetNotification) {
      addNotificationMinBeforeStartTime(minutesBeforeStartTime);
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
