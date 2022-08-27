import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Agenda } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import CalEventItem from '../components/calEventItem';
import * as db from '../database/database';
import FocusAwareStatusBar from '../components/focusAwareStatusBar';

function AgendaScreen() {
  const [loadedAppointments, setLoadedAppointments] = useState(null);

  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  const loadItemsForMonth = (day) => {
    const items = {};
    // console.log(`data is ${JSON.stringify(day, null, 1)}`);

    setTimeout(async () => {
      const calEvents = await db.getAllCalEvents();
      const repeaterEvents = await db.getAllRepeatersWithCalEvents();
      const dailies = repeaterEvents.filter((item) => item.periodicity === 'daily');
      const weeklies = repeaterEvents.filter((item) => item.periodicity === 'weekly');
      const monthlies = repeaterEvents.filter((item) => item.periodicity === 'monthly');

      console.log(`*** calEvents = ${JSON.stringify(calEvents, null, 1)}`);
      console.log(`*** repeaterCalEvents = ${JSON.stringify(repeaterEvents, null, 1)}`);
      console.log(`*** dailies = ${JSON.stringify(dailies, null, 1)}`);
      console.log(`*** weeklies = ${JSON.stringify(weeklies, null, 1)}`);
      console.log(`*** monthlies = ${JSON.stringify(monthlies, null, 1)}`);
      for (let i = -10; i < 31; i += 1) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        const currentDay = new Date(time);
        const dayOfWeek = currentDay.getDay();
        const dayOfMonth = currentDay.getDate();

        if (!items[strTime]) {
          items[strTime] = [];
          const appointmentsForDay = calEvents.filter((item) => {
            const eventDate = new Date(item.eventdate);
            const dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            // console.log(`dayOfAppointment == ${dayOfAppointment}`);
            // console.log(`strTime == ${strTime}`);
            // console.log(dayOfAppointment === strTime);
            return dayOfAppointment === strTime;
          });
          const repeatersForDay = repeaterEvents.filter((item) => {
            const isDaily = item.periodicity === 'daily';
            const isDayOfWeek = item.periodicity === 'weekly' && item.calday === dayOfWeek;
            const isDayOfMonth = item.periodicity === 'monthly' && item.caldate === dayOfMonth;
            const hasNoEndDate = item.enddate === null;
            const hasNotReachedEndDate = new Date(item.enddate) >= currentDay;
            return (isDaily || isDayOfWeek || isDayOfMonth) && (hasNotReachedEndDate || hasNoEndDate);
          });
          // console.log(`appointmentsForDay == ${JSON.stringify(appointmentsForDay, null, 1)}`);
          appointmentsForDay.forEach((appointment) => items[strTime].push(
            { calEventId: appointment.id, repeaterId: null },
          ));
          repeatersForDay.forEach((repeater) => items[strTime].push(
            { repeaterId: repeater.id, calEventId: null },
          ));
          // console.log(`items[strTime] == ${JSON.stringify(items[strTime], null, 1)}`);
        }
      }

      const newItems = {};
      Object.keys(items).forEach(key => {
        newItems[key] = items[key];
      });
      // console.log(`newItems == ${JSON.stringify(newItems, null, 1)}`);
      setLoadedAppointments(newItems);

      // db.getAllCalEvents()
      //   .then((result) => {
      //     for (let i = -10; i < 31; i += 1) {
      //       const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      //       const strTime = timeToString(time);

      //       if (!items[strTime]) {
      //         items[strTime] = [];
      //         const appointmentsForDay = result.filter((item) => {
      //           const eventDate = new Date(item.eventdate);
      //           const dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      //           // console.log(`dayOfAppointment == ${dayOfAppointment}`);
      //           // console.log(`strTime == ${strTime}`);
      //           // console.log(dayOfAppointment === strTime);
      //           return dayOfAppointment === strTime;
      //         });
      //         // console.log(`appointmentsForDay == ${JSON.stringify(appointmentsForDay, null, 1)}`);
      //         appointmentsForDay.forEach((appointment) => items[strTime].push({calEventId: appointment.id,}));
      //         // console.log(`items[strTime] == ${JSON.stringify(items[strTime], null, 1)}`);
      //       }
      //     }
      //   })
      //   .then(() => {
      //     const newItems = {};
      //     Object.keys(items).forEach(key => {
      //       newItems[key] = items[key];
      //     });
      //     // console.log(`newItems == ${JSON.stringify(newItems, null, 1)}`);
      //     setLoadedAppointments(newItems);
      //   });
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
