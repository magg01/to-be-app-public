import React, { useState, useRef } from 'react';
import { Button, View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import colors from '../utils/colors';

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

// look into proptypes library in order to codify the necessary functions to supply as props
function DateTimePicker(props) {
  const [isNativePickerVisible, setIsNativePickerVisibile] = useState(false);
  const [datePicked, setDatePicked] = useState(props.calEvent ? new Date(props.calEvent.date) : new Date());
  const [startTimePicked, setStartTimePicked] = useState(props.calEvent ? new Date(props.calEvent.start) : new Date());
  const [endTimePicked, setEndTimePicked] = useState(props.calEvent ? new Date(props.calEvent.end) : new Date());

  const pickerMode = useRef(nativePickerModeEnum.date);
  const updateValue = useRef(updateValueEnum.date);

  const showNativePicker = (valueToUpdate) => {
    if (valueToUpdate === updateValueEnum.date) {
      pickerMode.current = nativePickerModeEnum.date;
      updateValue.current = updateValueEnum.date;
    } else if (valueToUpdate === updateValueEnum.startTime) {
      pickerMode.current = nativePickerModeEnum.time;
      updateValue.current = updateValueEnum.startTime;
    } else if (valueToUpdate === updateValueEnum.endTime) {
      pickerMode.current = nativePickerModeEnum.time;
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

  const zeroPadTime = (time) => {
    // would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
    // could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go.
    if (time < 10) {
      return `0${time}`;
    }
    return time;
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
          <View style={styles.selectorRowContainer}>
            <Text style={styles.dateTimePickerHeader}>
              Date:
            </Text>
            <Text style={styles.dateTimePickerDateTime}>
              {datePicked.toDateString()}
            </Text>
            <MaterialCommunityIcons
              name="calendar-edit"
              size={IconSize}
              color={colors.plans.textOrIconOnWhite}
              onPress={() => showNativePicker('date')}
            />
          </View>
          {!props.dateOnly
            && (
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
            )}
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => onClose(false)} />
            <Button title="Submit" onPress={() => onClose(true)} />
          </View>
          <DateTimePickerModal
            isVisible={isNativePickerVisible}
            mode={pickerMode.current}
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

export default DateTimePicker;
