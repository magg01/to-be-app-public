import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { confirmRemoveNotification, cancelNotificationEvent } from '../components/testNotifications';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as db from '../database/database';

//move this to components section (with style)
const CalEventItem = ({appointment}) => {
  const [calEventWithDetails, setCalEventWithDetails] = useState(undefined);
  const [eventDisplayStartTime, setEventDisplayStartTime] = useState(null);
  const [eventDisplayEndTime, setEventDisplayEndTime] = useState(null);

  useEffect(() => {
    (async () => {
      setCalEventWithDetails(await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId))
    })()
  }, [])

  
  useEffect(() => {
    if(calEventWithDetails != undefined){
      const eventStartTimeDate = new Date(calEventWithDetails.eventstarttime);
      const eventEndTimeDate = new Date(calEventWithDetails.eventendtime);
      setEventDisplayStartTime(`${zeroPadTime(eventStartTimeDate.getHours())}:${zeroPadTime(eventStartTimeDate.getMinutes())}`);
      setEventDisplayEndTime(`${zeroPadTime(eventEndTimeDate.getHours())}:${zeroPadTime(eventEndTimeDate.getMinutes())}`);
    }
  }, [calEventWithDetails])

  const zeroPadTime = (time) => {
    //would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
    //could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go. 
    if(time < 10){
      return `0${time}`;
    } else {
      return time;
    }
  }

  const onNotificationIconPressed = async () => {
    //check if the calevent already has a notification identifier
    if(calEventWithDetails.eventnotification != null){
      console.log(`present notification with identifier: ${calEventWithDetails.eventnotification}`);
      //ask if the currently set notification should be removed
      const shouldRemove = await confirmRemoveNotification();
      //if yes
      if(shouldRemove){
        //delete the scheduled notification
        cancelNotificationEvent(calEventWithDetails.eventnotification);
        //remove the identifier from the database
        await db.removeNotificationFromCalEvent(calEventWithDetails.id);
        setCalEventWithDetails(await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId));
      //if no
      } else {
        //do nothing
      }
    } else {
      //try to add
      const notificationID = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Be: ${calEventWithDetails.tobeitem_title}`,
          body: calEventWithDetails.plan_title,
        },
        trigger: {
          seconds: 3,
        },
      })
      await db.addNotificationToCalEvent(calEventWithDetails.id, notificationID);
      setCalEventWithDetails(await db.getCalEventWithPlanDetailsByCalEventId(appointment.calEventId));
    }
  }

  if(calEventWithDetails === undefined){
    return (
      //need to add loading indicator here
      <View style={[styles.item, { height: appointment.height, flexDirection: 'row' }]}>
        <Text>Loading</Text>
      </View>
    )
  } else {
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
      </View>
    );
  }
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
});

export default CalEventItem;