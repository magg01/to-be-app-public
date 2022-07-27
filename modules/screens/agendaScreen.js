import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Agenda, calendarTheme } from 'react-native-calendars';

const AgendaScreen = () => {
  const appointments = {
    "2021-03-11": [{
        name: "Jeevan More",
        start: "10:00 AM",
        end: "10:30 AM",
        type: "Follow Up",
      },
      {
        name: "Seema More",
        start: "10:30 AM",
        end: "11:30 AM",
        type: "New Consult",
      },
    ],
    "2021-03-12": [{
        name: "Madhura Utekar",
        start: "10:00 AM",
        end: "11:00 AM",
        type: "Accute",
      },
      {
        name: "Aditya Utekar",
        start: "12:00 PM",
        end: "12:30 PM",
        type: "Follow Up",
      },
      {
        name: "Aditya Utekar",
        start: "13:00 PM",
        end: "13:30 PM",
        type: "Follow Up",
      },
      {
        name: "Aditya Utekar",
        start: "14:00 PM",
        end: "14:30 PM",
        type: "Follow Up",
      },
      {
        name: "Aditya Utekar",
        start: "15:00 PM",
        end: "15:30 PM",
        type: "Follow Up",
      },
    ]
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={appointments}
        renderItem={(item) => {
          return renderItem(item);
        }}
        selected={"2021-03-11"}
        //pastScrollRange={0}
        //futureScrollRange={0}
        renderEmptyData={renderEmptyItem}
        // renderEmptyDate={renderEmptyDate}
        //theme={calendarTheme}
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