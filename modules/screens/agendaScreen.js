import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Agenda, calendarTheme } from 'react-native-calendars';
import CalEventItem from '../components/calEventItem';
import * as db from '../database/database';


const AgendaScreen = () => {
  const [loadedAppointments, setLoadedAppointments] = useState(null)
          
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
        //account for timezone differences for the date of the appointment
        let dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
        if(!appointments[dayOfAppointment]){
           appointments[dayOfAppointment] = []
        }
        appointments[dayOfAppointment].push({
          calEventId: result[event].id,
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
          return <CalEventItem appointment={item} />
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
});

export { AgendaScreen }