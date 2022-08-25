import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Agenda } from 'react-native-calendars';
import CalEventItem from '../components/calEventItem';
import * as db from '../database/database';
import FocusAwareStatusBar from '../components/focusAwareStatusBar';
import { useFocusEffect } from '@react-navigation/native';

function AgendaScreen() {
  const [loadedAppointments, setLoadedAppointments] = useState(null);

  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  const loadItemsForMonth = (day) => {
    const items = {};
    console.log(`data is ${JSON.stringify(day, null, 1)}`);

    setTimeout(() => {
      db.getAllCalEvents()
        .then((result) => {
          for (let i = -10; i < 31; i += 1) {
            const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            const strTime = timeToString(time);

            if (!items[strTime]) {
              items[strTime] = [];
              const appointmentsForDay = result.filter((item) => {
                const eventDate = new Date(item.eventdate);
                const dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                // console.log(`dayOfAppointment == ${dayOfAppointment}`);
                // console.log(`strTime == ${strTime}`);
                // console.log(dayOfAppointment === strTime);
                return dayOfAppointment === strTime;
              });
              // console.log(`appointmentsForDay == ${JSON.stringify(appointmentsForDay, null, 1)}`);
              appointmentsForDay.forEach((appointment) => items[strTime].push({calEventId: appointment.id,}));
              // console.log(`items[strTime] == ${JSON.stringify(items[strTime], null, 1)}`);
            }
          }
        })
        .then(() => {
          const newItems = {};
          Object.keys(items).forEach(key => {
            newItems[key] = items[key];
          });
          // console.log(`newItems == ${JSON.stringify(newItems, null, 1)}`);
          setLoadedAppointments(newItems);
        });
    }, 1000);
  };

  useFocusEffect(
    useCallback(() => {
      loadItemsForMonth({ timestamp: new Date().getTime() });
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <Button title={'all events'} onPress={() => db.getAllCalEvents()} /> */}
      {/* <Button title={'test join db'} onPress={() => db.getAllCalEventsWithPlanDetails()} /> */}
      <Agenda
        items={loadedAppointments}
        renderItem={(item) => <CalEventItem appointment={item} />}
        selected={Date()}
        // max months can scroll to past on full calendar
        pastScrollRange={1}
        // max months can scroll to future on full calendar
        futureScrollRange={12}
        loadItemsForMonth={loadItemsForMonth}
      />
      <FocusAwareStatusBar style="dark"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
});

export default AgendaScreen;
