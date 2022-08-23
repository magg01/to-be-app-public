import React, { useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet, Text, TextInput, Alert, TouchableOpacity,
} from 'react-native';
import * as db from '../database/database';
import DateTimePicker from './dateTimePicker';
import animations from '../utils/animations';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

function AddPlan(props) {
  const toBeId = useRef(props.toBeId);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const calEvent = useRef(null);

  const addPlan = () => {
    db.addPlan(newPlanTitle, toBeId.current, calEvent.current)
      .then((success) => {
        if (success) {
          props.onAdd();
        } else {
          Alert.alert("Unable to add a new plan at this time.");
        }
      });
  };

  const onDateTimeChange = (eventDate, eventStartTime, eventEndTime) => {
    calEvent.current = {
      date: eventDate.toISOString(),
      start: eventStartTime.toISOString(),
      end: eventEndTime.toISOString(),
    };
    setShowDateTimePicker(false);
  };

  return (
    <Animated.View
      style={styles.container}
      entering={animations.addPlan.addPlanView.entering}
      exiting={animations.addPlan.addPlanView.exiting}
    >
      <Text style={styles.questionText(props.tintColor)}>
        {CONSTANT_STRINGS.PLANS.ADD_PLAN.PROMPT_TEXT(props.toBeItemTitle.toLowerCase())}
      </Text>
      <TextInput style={styles.input(props.tintColor)} onChangeText={(text) => setNewPlanTitle(text)} />
      <TouchableOpacity style={styles.addButton} onPress={addPlan}>
        <Text>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowDateTimePicker(true)}>
        <Text>Cal</Text>
      </TouchableOpacity>
      {showDateTimePicker
        && (
        <DateTimePicker
          modalTitleText={"Add an event to the calendar for this plan."}
          calEvent={calEvent.current}
          onDateTimeChange={
            // eslint-disable-next-line max-len
            (eventDate, eventStartTime, eventEndTime) => onDateTimeChange(eventDate, eventStartTime, eventEndTime)
          }
          returnToScreenName="ViewToBeScreen"
          onCancel={() => setShowDateTimePicker(false)}
        />
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  input: (tintColor) => ({
    width: '50%',
    margin: 12,
    borderBottomWidth: 2,
    padding: 6,
    fontSize: 20,
    borderBottomColor: tintColor,
    color: tintColor,
  }),
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.general.defaultWhite,
  },
  questionText: (tintColor) => ({
    color: tintColor,
    fontSize: 20,
  }),
});

export default AddPlan;
