import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Agenda } from 'react-native-calendars';
import CalEventItem from '../components/calEventItem';
import * as db from '../database/database';

function AgendaScreen() {
  const [loadedAppointments, setLoadedAppointments] = useState(null);
  const renderEmptyItem = () => (
    <View>
      <Text>Empty</Text>
    </View>
  );

  const loadItemsForMonth = (data) => {
    // need to use data object passed to method here to judiciously get relevant
    // calevents from the database based on their date. (not as currently getting all of them)
    const appointments = {};
    db.getAllCalEvents()
      .then((result) => {
        const keys = Object.keys(result);
        keys.forEach((key) => {
          const eventDate = new Date(result[key].eventdate);
          // account for timezone differences for the date of the appointment
          const dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          if (!appointments[dayOfAppointment]) {
            appointments[dayOfAppointment] = [];
          }
          appointments[dayOfAppointment].push({
            calEventId: result[key].id,
          });
        });
      }).then(() => {
        setLoadedAppointments(appointments);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Button title={'all events'} onPress={() => db.getAllCalEvents()} /> */}
      {/* <Button title={'test join db'} onPress={() => db.getAllCalEventsWithPlanDetails()} /> */}
      <Agenda
        items={loadedAppointments}
        renderItem={(item) => <CalEventItem appointment={item} />}
        selected={Date('now')}
        // pastScrollRange={0}
        // futureScrollRange={0}
        renderEmptyData={renderEmptyItem}
        // renderEmptyDate={renderEmptyDate}
        // theme={calendarTheme}
        loadItemsForMonth={loadItemsForMonth}
      />
      <StatusBar style={"auto"}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
});

export default AgendaScreen;
