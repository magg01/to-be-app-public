import React, { useState, useRef } from "react";
import { Button, View, Text } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as db from '../database/database';

const Example = (props) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePicked, setDatePicked] = useState(props.calEvent ? new Date(props.calEvent.date) : new Date());
  const [startTimePicked, setStartTimePicked] = useState(props.calEvent ? new Date(props.calEvent.start) : new Date());
  const [endTimePicked, setEndTimePicked] = useState(props.calEvent ? new Date(props.calEvent.end) : new Date());
  const pickerMode = useRef('date');
  const updateValue = useRef('date');

  const showDatePicker = (mode) => {
    if(mode === 'date'){
      pickerMode.current = 'date';
      updateValue.current = 'date'  
    } else if (mode === 'startTime'){
      pickerMode.current = 'time';
      updateValue.current = 'startTime'  
    } else if (mode === 'endTime'){
      pickerMode.current = 'time';
      updateValue.current = 'endTime'  
    }
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if(updateValue.current === 'date'){
      console.log("A date has been picked: ", date);
      setDatePicked(date);
    } else if(updateValue.current === 'startTime'){
      console.log("A time has been picked: ", date);
      setStartTimePicked(date);
    } else if(updateValue.current === 'endTime'){
      console.log("A time has been picked: ", date);
      setEndTimePicked(date);
    }
    hideDatePicker();
  };

  const zeroPadTime = (time) => {
    //would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
    //could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go. 
    if(time < 10){
      return `0${time}`;
    } else {
      return time;
    }
  }

  const onClose = (shouldUpdateDateTime) => {
    if(shouldUpdateDateTime){
      props.onDateTimeChange(datePicked, startTimePicked, endTimePicked);
    } else {
      props.onCancel();
    }
  }

  return (
    <View>
      <Button title="Show Date Picker" onPress={() => showDatePicker('date')} />
      <Text style={{color:'white'}}>
        Date: {datePicked.toDateString()}
      </Text>
      <Button title="Show Start Time Picker" onPress={() => showDatePicker('startTime')} />
      <Text style={{color:'white'}}>
        Start time: {zeroPadTime(startTimePicked.getHours())}:{zeroPadTime(startTimePicked.getMinutes())}
      </Text>
      <Button title="Show End Time Picker" onPress={() => showDatePicker('endTime')} />
      <Text style={{color:'white'}}>
        End time: {zeroPadTime(endTimePicked.getHours())}:{zeroPadTime(endTimePicked.getMinutes())}
      </Text>
      <Button title="submit" onPress={() => onClose(true)} />
      <Button title="cancel" onPress={() => onClose(false)} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={pickerMode.current}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default Example;