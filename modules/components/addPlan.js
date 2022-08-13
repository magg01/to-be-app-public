import React, { useEffect, useRef, useState } from 'react'
import Animated from 'react-native-reanimated';
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity } from 'react-native'
import * as db from '../database/database';
import DateTimePicker from './dateTimePicker';
import { animations } from '../utils/animations';

export default AddPlan = (props) => {
  const toBeId = useRef(props.toBeId);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const calEvent = useRef(null);

  const addPlan = () => {
    db.addPlan(newPlanTitle, toBeId.current, calEvent.current)
    .then((success) => {
      if(success){
        props.onAddNewPlan();
      } else {
        Alert.alert("Unable to add a new plan at this time.");
      }
    });
  }

  const addCalendar = () => {
    setShowDateTimePicker(true);
  }

  const onDateTimeChange = (eventDate, eventStartTime, eventEndTime) => {
    calEvent.current = {
      date: eventDate.toISOString(),
      start: eventStartTime.toISOString(),
      end: eventEndTime.toISOString()
    }
    setShowDateTimePicker(false);
  }

  return (
    <Animated.View 
      style={styles.container}
      entering={animations.addPlan.addPlanView.entering}
      exiting={animations.addPlan.addPlanView.exiting}
    >

      <Text style={{color: 'white', fontSize: 20}}>How can you be more {props.toBeItemTitle.toLowerCase()}?</Text>
      <TextInput style={styles.input} onChangeText={(text) => setNewPlanTitle(text)} />
      <TouchableOpacity style={styles.addButton} onPress={addPlan}>
        <Text>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={addCalendar}>
        <Text>Cal</Text>
      </TouchableOpacity>
      {showDateTimePicker && <DateTimePicker 
        calEvent={calEvent.current}
        onDateTimeChange={(eventDate, eventStartTime, eventEndTime) => onDateTimeChange(eventDate, eventStartTime, eventEndTime)} 
        onCancel={() => setShowDateTimePicker(false)}
      />} 
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  input: {
    width: "50%",
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 20,
    color: 'white'
  },
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white'
  }
})