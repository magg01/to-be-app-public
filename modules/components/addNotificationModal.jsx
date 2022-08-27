import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Modal, Button, TextInput,
} from 'react-native';
import colors from '../utils/colors';

function AddNotificationModal({isVisible, onRequestClose, onDismiss, eventItem, onShouldSetNotification}) {
  const [minutesBeforeStartTime, setMinutesBeforeStartTime] = useState('0');

  const onClose = (shouldSetNotification) => {
    if (shouldSetNotification) {
      onShouldSetNotification(minutesBeforeStartTime);
      onDismiss();
    } else {
      onDismiss();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      statusBarTranslucent
      visible={isVisible}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.titleText}>
            Add notification for {eventItem.plan_title}
          </Text>
          <View style={styles.selectorRowContainer}>
            <Text style={styles.dateTimePickerHeader}>
              Minutes before start time:
            </Text>
            <TextInput
              style={styles.input}
              autoFocus
              showSoftInputOnFocus
              value={minutesBeforeStartTime}
              onChangeText={setMinutesBeforeStartTime}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => onClose(false)} />
            <Button title="Submit" onPress={() => onClose(true)} />
          </View>
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
    backgroundColor: colors.modals.outerColorOpacity,
  },
  innerContainer: {
    backgroundColor: colors.general.defaultWhite,
    padding: 20,
    opacity: 1,
    shadowColor: colors.general.defaultBlack,
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
  buttonRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  selectorRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 3,
    marginBottom: 18,
  },
  dateTimePickerHeader: {
    color: colors.plans.textOrIconOnWhite,
    fontSize: 20,
    minWidth: '18%',
  },
  input: {
    marginLeft: 12,
    fontSize: 24,
  },
});

export default AddNotificationModal;
