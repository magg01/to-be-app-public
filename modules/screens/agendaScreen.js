import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert, View, Button, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Agenda, calendarTheme } from 'react-native-calendars';
import * as db from '../database/database';

const AgendaScreen = () => {
  const [loadedAppointments, setLoadedAppointments] = useState(null)  

  const renderItem = (item) => {
    return (
        <TouchableOpacity
          style={[styles.item, { height: item.height }]}
          onPress={() => Alert.alert(item.name)}
        >
          <Text style={styles.timing}>
            {item.start} - {item.end}
          </Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </TouchableOpacity>
    );
  };

  const renderEmptyItem = () => {
    return (
      <View>
        <Text>Empty</Text>
      </View>
    );
  };

  const testLoadItemsForMonth = (data) => {
    //need to use data object passed to method here to judiciously get relevant calevents from the database based on their date. (not as currently getting all of them)
    //also need to get joined table with Plans
    let appointments = {}
    db.getAllCalEventsWithPlanDetails().then((result) => {
      for(const event in result){
        let eventDate = new Date(result[event].eventdate);
        let eventStartTime = new Date(result[event].eventstarttime);
        let eventEndTime = new Date(result[event].eventendtime);
        let dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
        if(!appointments[dayOfAppointment]){
           appointments[dayOfAppointment] = []
        }
        //would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
        //could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go. 
        let startHours = eventStartTime.getHours();
        if (startHours < 10) {
          startHours = `0${startHours}`;
        }
        let startMinutes = eventStartTime.getMinutes();
        if (startMinutes < 10) {
          startMinutes = `0${startMinutes}`;
        }
        let endHours = eventEndTime.getHours();
        if (endHours < 10) {
          endHours = `0${endHours}`;
        }
        let endMinutes = eventEndTime.getMinutes();
        if (endMinutes < 10) {
          endMinutes = `0${endMinutes}`;
        }
        appointments[dayOfAppointment].push({
          name: result[event].plan_title,
          start: `${startHours}:${startMinutes}`,
          end: `${endHours}:${endMinutes}`,
          type: `Be: ${result[event].tobeitem_title}`,
          image: result[event].imageBackgroundUri
        })
      }
    }).then(() => {
      setLoadedAppointments(appointments);
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button title={'all events'} onPress={() => db.getAllCalEvents()} />
      <Button title={'test join db'} onPress={() => db.getAllCalEventsWithPlanDetails()} />
      <Agenda
        items={loadedAppointments}
        renderItem={(item) => {
          return renderItem(item);
        }}
        selected={Date('now')}
        //pastScrollRange={0}
        //futureScrollRange={0}
        renderEmptyData={renderEmptyItem}
        // renderEmptyDate={renderEmptyDate}
        //theme={calendarTheme}
        loadItemsForMonth={testLoadItemsForMonth}
      />
      <StatusBar style={"auto"}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
});

export { AgendaScreen }