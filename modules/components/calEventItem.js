import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { addRemoveNotificationOnCalEvent } from '../components/testNotifications';
import Ionicons from '@expo/vector-icons/Ionicons';

//move this to components section (with style)
const CalEventItem = ({item}) => {
  const [notificationPresent, setNotificationPresent] = useState(item.notification != null);

  const addRemoveNotification = async (calEventId) => {
    console.log(calEventId);
    const notificationPresent = await addRemoveNotificationOnCalEvent(calEventId);
    if(notificationPresent){
      setNotificationPresent(true);
    } else {
      setNotificationPresent(false);
    }
  }

  return (
    <View style={[styles.item, { height: item.height, flexDirection: 'row' }]}>
      <TouchableOpacity
        style={{ flexGrow: 1}}
        onPress={() => Alert.alert(item.name)}
      >
        <Text style={styles.timing}>
          {item.start} - {item.end}
        </Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.type}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{alignSelf: 'center', }} onPress={() => addRemoveNotification(item.calEventId)}>
        <Ionicons name="notifications-outline" size={24} color={notificationPresent ? "black" : "lightgrey" } />
      </TouchableOpacity>
    </View>
  );
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