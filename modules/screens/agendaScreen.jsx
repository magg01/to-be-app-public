import React, { useCallback, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Agenda } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import CalEventItem from '../components/calEventItem';
import * as db from '../database/database';
import FocusAwareStatusBar from '../components/focusAwareStatusBar';
import { calEventTypeEnum } from '../utils/enums';

function AgendaScreen() {
  const [loadedAppointments, setLoadedAppointments] = useState(null);
  const agendaRef = useRef(undefined);

  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  const loadItemsForMonth = useCallback(async (day) => {
    const items = {};

    const calEvents = await db.getAllCalEventsWithPlanDetails();
    const repeaterEvents = await db.getAllRepeaterEventsWithPlanDetails();

    for (let i = -10; i < 31; i += 1) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      const strTime = timeToString(time);
      const currentDay = new Date(time);
      const dayOfWeek = currentDay.getDay();
      const dayOfMonth = currentDay.getDate();

      if (!items[strTime]) {
        items[strTime] = [];
        const calEventsForDay = calEvents.filter((item) => {
          const eventDate = new Date(item.eventdate);
          const dayOfAppointment = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          return dayOfAppointment === strTime;
        });
        const repeatersForDay = repeaterEvents.filter((item) => {
          const isDaily = item.periodicity === 'daily';
          const isDayOfWeek = item.periodicity === 'weekly' && item.calday === dayOfWeek;
          const isDayOfMonth = item.periodicity === 'monthly' && item.caldate === dayOfMonth;
          const hasNoEndDate = item.enddate === null;
          const hasNotReachedEndDate = new Date(item.enddate) >= currentDay;
          return (
            (isDaily || isDayOfWeek || isDayOfMonth) && (hasNotReachedEndDate || hasNoEndDate)
          );
        });
        calEventsForDay.forEach((calEvent) => items[strTime].push(
          {
            type: calEventTypeEnum.singleEvent,
            id: calEvent.id,
            eventDate: calEvent.eventdate,
            startTime: calEvent.eventstarttime,
            endTime: calEvent.eventendtime,
            notificationId: calEvent.eventnotification,
            planTitle: calEvent.plan_title,
            toBeTitle: calEvent.tobeitem_title,
          },
        ));
        repeatersForDay.forEach((repeater) => items[strTime].push(
          {
            type: calEventTypeEnum.repeaterEvent,
            id: repeater.id,
            eventDate: null,
            periodicity: repeater.periodicity,
            startTime: repeater.calstarttime,
            endTime: repeater.calendtime,
            calDay: repeater.calday,
            calDate: repeater.caldate,
            calEndDate: repeater.enddate,
            notificationId: repeater.notificationId,
            planTitle: repeater.plan_title,
            toBeTitle: repeater.tobeitem_title,
          },
        ));
        // items[strTime].sort((a, b) => {
        //   // TODO: check if this is necessary, sort by string should work too.
        //   const startA = new Date(a.startTime);
        //   const startB = new Date(b.startTime);
        //   return startA - startB;
        // });
      }
    }

    const newItems = {};
    Object.keys(items).forEach((key) => {
      newItems[key] = items[key];
    });
    setLoadedAppointments(newItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItemsForMonth({ timestamp: new Date().getTime() });
    }, [loadItemsForMonth]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        ref={agendaRef}
        items={loadedAppointments}
        renderItem={(item) => <CalEventItem eventItem={item} onEventModified={() => loadItemsForMonth({timestamp: new Date().getTime()})} />}
        selected={Date()}
        // max months can scroll to past on full calendar
        pastScrollRange={1}
        // max months can scroll to future on full calendar
        futureScrollRange={12}
        loadItemsForMonth={loadItemsForMonth}
        showOnlySelectedDayItems
      />
      <FocusAwareStatusBar style={'dark'}/>
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
