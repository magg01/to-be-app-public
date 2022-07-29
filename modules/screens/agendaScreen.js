import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert, View } from 'react-native';
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
    let appointments = {}
    db.getAllCalEvents().then((result) => {
      for(const event in result){
        let eventDate = new Date(result[event].eventdate);
        let eventStartTime = new Date(result[event].eventstarttime);
        let eventEndTime = new Date(result[event].eventendtime);
        let dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
        if(!appointments[dayOfAppointment]){
           appointments[dayOfAppointment] = []
        }
        appointments[dayOfAppointment].push({
          name: "this should be filled in from the plan",
          start: `${eventStartTime.getHours()}:${eventStartTime.getMinutes()}`,
          end: `${eventEndTime.getHours()}:${eventEndTime.getMinutes()}`,
          type: "this could maybe be the to-be title"
        })
      }
    }).then(() => {
      setLoadedAppointments(appointments);
    })
  }

  return (
    <SafeAreaView style={styles.container}>
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