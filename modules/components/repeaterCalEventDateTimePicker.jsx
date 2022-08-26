import React, { useState, useRef } from 'react';
import { Button, View, Text, StyleSheet, Modal, Alert } from 'react-native';
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

// TODO: look into proptypes library in order to codify the necessary functions to supply as props
function RepeaterCalEventDateTimePicker(props) {
  const [isNativePickerVisible, setIsNativePickerVisibile] = useState(false);
  const [datePicked, setDatePicked] = useState(null);
  const [startTimePicked, setStartTimePicked] = useState(new Date());
  const [endTimePicked, setEndTimePicked] = useState(new Date());
  const [dayOfTheWeek, setDayOfTheWeek] = useState(null);
  const [dayOfTheMonth, setdayOfTheMonth] = useState(null);

  const updateValue = useRef(updateValueEnum.date);

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

  const onClose = (shouldReturnDateTime) => {
    if (shouldReturnDateTime) {
      if (props.dateOnly) {
        props.onSubmit({ date: datePicked });
      } else {
        props.onSubmit({ date: datePicked, startTime: startTimePicked, endTime: endTimePicked });
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
            <View style={styles.selectorRowContainer}>
              <Text style={styles.dateTimePickerHeader}>
                Day:
              </Text>
              <Text style={styles.dateTimePickerDateTime}>
                {dayOfTheWeek}
              </Text>
              <MaterialCommunityIcons
                name="more"
                size={IconSize}
                color={colors.plans.textOrIconOnWhite}
                onPress={() => Alert.alert("weekday picker here")}
              />
            </View>
            )}
          {props.periodicity === 'monthly'
            && (
            <View style={styles.selectorRowContainer}>
              <Text style={styles.dateTimePickerHeader}>
                Day of month:
              </Text>
              <Text style={styles.dateTimePickerDateTime}>
                {dayOfTheMonth}
              </Text>
              <MaterialCommunityIcons
                name="more"
                size={IconSize}
                color={colors.plans.textOrIconOnWhite}
                onPress={() => Alert.alert("day of month picker here")}
              />
            </View>
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
