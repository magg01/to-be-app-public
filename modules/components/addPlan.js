import React, { useRef, useState } from 'react'
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity } from 'react-native'
import * as db from '../database/database';

export default AddPlan = (props) => {
  const toBeId = useRef(props.toBeId);
  const [newPlanTitle, setNewPlanTitle] = useState('');

  const addPlan = () => {
    db.addPlan(newPlanTitle, toBeId.current)
    .then((success) => {
      if(success){
        props.onAddNewPlan();
      } else {
        Alert.alert("Unable to add a new plan at this time.");
      }
    });
  }

  const addNotification = () => {
    Alert.alert("Add notification here");
  }

  const addCalendar = () => {
    Alert.alert("Add to calendar here");
  }

  return (
    <View style={styles.container}>
      <Text>How can you be </Text>
      <TextInput style={styles.input} onChangeText={(text) => setNewPlanTitle(text)} />
      <TouchableOpacity style={styles.addButton} onPress={addPlan}>
        <Text>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={addNotification}>
        <Text>Not</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={addCalendar}>
        <Text>Cal</Text>
      </TouchableOpacity>
    </View>
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