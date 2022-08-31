import React, { useState, useRef, useEffect } from 'react';
import { Button, View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import colors from '../utils/colors';
import { zeroPadTime } from '../utils/datetime';

const nativePickerModeEnum = {
  date: 'date',
  time: 'time',
};

const updateValueEnum = {
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
};

const IconSize = 28;

function RepeaterCalEventDateTimePicker(props) {
  const [isNativePickerVisible, setIsNativePickerVisibile] = useState(false);
  const [datePicked, setDatePicked] = useState(null);
  const [startTimePicked, setStartTimePicked] = useState(new Date());
  const [endTimePicked, setEndTimePicked] = useState(new Date());
  const [selectedDayOfTheWeek, setSelectedDayOfTheWeek] = useState(null);
  const [selectedDayOfTheMonth, setSelectedDayOfTheMonth] = useState(null);

  const updateValue = useRef(updateValueEnum.date);

  useEffect(() => {
    const dayOfTheMonth = new Date().getDate();
    setSelectedDayOfTheMonth(dayOfTheMonth > 28 ? 1 : dayOfTheMonth);
  }, []);

  useEffect(() => {
    setSelectedDayOfTheWeek(new Date().getDay());
  }, []);

  const showNativePicker = (valueToUpdate) => {
    if (valueToUpdate === updateValueEnum.startTime) {
      updateValue.current = updateValueEnum.startTime;
    } else if (valueToUpdate === updateValueEnum.endTime) {
      updateValue.current = updateValueEnum.endTime;
    }
    setIsNativePickerVisibile(true);
  };

  const hideNativePicker = () => {
    setIsNativePickerVisibile(false);
  };

  const handleConfirm = (date) => {
    if (updateValue.current === updateValueEnum.date) {
      console.log('A date has been picked: ', date);
      setDatePicked(date);
    } else if (updateValue.current === updateValueEnum.startTime) {
      console.log('A start time has been picked: ', date);
      setStartTimePicked(date);
    } else if (updateValue.current === updateValueEnum.endTime) {
      console.log('An end time has been picked: ', date);
      setEndTimePicked(date);
    }
    hideNativePicker();
  };

  const onClose = (shouldSetRepeatingCalEvent) => {
    if (shouldSetRepeatingCalEvent) {
      if (props.periodicity === 'daily') {
        props.onSubmit({ startTime: startTimePicked, endTime: endTimePicked });
      } else if (props.periodicity === 'weekly') {
        props.onSubmit({ dayOfWeek: selectedDayOfTheWeek, startTime: startTimePicked, endTime: endTimePicked });
      } else if (props.periodicity === 'monthly') {
        props.onSubmit({ dayOfMonth: selectedDayOfTheMonth, startTime: startTimePicked, endTime: endTimePicked });
      }
    } else {
      props.onCancel();
    }
  };

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType={'fade'}
      onRequestClose={() => onClose(false)}
    >
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          {props.modalTitleText
            && (
              <Text style={styles.titleText}>{props.modalTitleText}</Text>
            )}
          {props.periodicity === 'weekly'
            && (
            <Picker
              selectedValue={selectedDayOfTheWeek}
              onValueChange={(itemValue, itemIndex) => setSelectedDayOfTheWeek(itemValue)}
            >
              <Picker.Item label="Monday" value={1} />
              <Picker.Item label="Tuesday" value={2} />
              <Picker.Item label="Wednesday" value={3} />
              <Picker.Item label="Thursday" value={4} />
              <Picker.Item label="Friday" value={5} />
              <Picker.Item label="Saturday" value={6} />
              <Picker.Item label="Sunday" value={0} />
            </Picker>
            )}
          {props.periodicity === 'monthly'
            && (
              <Picker
                selectedValue={selectedDayOfTheMonth}
                onValueChange={(itemValue, itemIndex) => setSelectedDayOfTheMonth(itemValue)}
              >
                <Picker.Item label="1st" value={1} />
                <Picker.Item label="2nd" value={2} />
                <Picker.Item label="3rd" value={3} />
                <Picker.Item label="4th" value={4} />
                <Picker.Item label="5th" value={5} />
                <Picker.Item label="6th" value={6} />
                <Picker.Item label="7th" value={7} />
                <Picker.Item label="8th" value={8} />
                <Picker.Item label="9th" value={9} />
                <Picker.Item label="10th" value={10} />
                <Picker.Item label="11th" value={11} />
                <Picker.Item label="12th" value={12} />
                <Picker.Item label="13th" value={13} />
                <Picker.Item label="14th" value={14} />
                <Picker.Item label="15th" value={15} />
                <Picker.Item label="16th" value={16} />
                <Picker.Item label="17th" value={17} />
                <Picker.Item label="18th" value={18} />
                <Picker.Item label="19th" value={19} />
                <Picker.Item label="20th" value={20} />
                <Picker.Item label="21st" value={21} />
                <Picker.Item label="22nd" value={22} />
                <Picker.Item label="23rd" value={23} />
                <Picker.Item label="24th" value={24} />
                <Picker.Item label="25th" value={25} />
                <Picker.Item label="26th" value={26} />
                <Picker.Item label="27th" value={27} />
                <Picker.Item label="28th" value={28} />
              </Picker>
            )}
          <>
            <View style={styles.selectorRowContainer}>
              <Text style={styles.dateTimePickerHeader}>
                Start:
              </Text>
              <Text style={styles.dateTimePickerDateTime}>
                {zeroPadTime(startTimePicked.getHours())}:{zeroPadTime(startTimePicked.getMinutes())}
              </Text>
              <MaterialCommunityIcons
                name="clock-edit-outline"
                size={IconSize}
                color={colors.plans.textOrIconOnWhite}
                onPress={() => showNativePicker('startTime')}
              />
            </View>
            <View style={styles.selectorRowContainer}>
              <Text style={styles.dateTimePickerHeader}>
                End:
              </Text>
              <Text style={styles.dateTimePickerDateTime}>
                {zeroPadTime(endTimePicked.getHours())}:{zeroPadTime(endTimePicked.getMinutes())}
              </Text>
              <MaterialCommunityIcons
                name="clock-edit-outline"
                size={IconSize}
                color={colors.plans.textOrIconOnWhite}
                onPress={() => showNativePicker('endTime')}
              />
            </View>
          </>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => onClose(false)} />
            <Button title="Submit" onPress={() => onClose(true)} />
          </View>
          <DateTimePickerModal
            isVisible={isNativePickerVisible}
            mode={nativePickerModeEnum.time}
            onConfirm={handleConfirm}
            onCancel={hideNativePicker}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(40,40,40,0.8)',
  },
  innerContainer: {
    backgroundColor: colors.general.defaultWhite,
    padding: 20,
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  titleText: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 12,
    color: colors.plans.textOrIconOnWhite,
  },
  selectorRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: colors.plans.textOrIconOnWhite,
    marginHorizontal: 3,
    marginBottom: 18,
  },
  dateTimePickerHeader: {
    color: colors.plans.textOrIconOnWhite,
    fontSize: 20,
    minWidth: '18%',
  },
  dateTimePickerDateTime: {
    color: colors.plans.textOrIconOnWhite,
    fontSize: 16,
    marginLeft: 20,
    flexGrow: 1,
  },
  buttonRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default RepeaterCalEventDateTimePicker;
