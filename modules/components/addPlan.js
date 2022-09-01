/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet, Text, TextInput, Alert, TouchableOpacity, View,
} from 'react-native';
import * as db from '../database/database';
import animations from '../utils/animations';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

function AddPlan({ toBeId, onAdd, toBeItemTitle, tintColor }) {
  const [newPlanTitle, setNewPlanTitle] = useState('');

  const addPlan = () => {
    db.addPlan(newPlanTitle, toBeId)
      .then((success) => {
        if (success) {
          onAdd();
        } else {
          Alert.alert('Unable to add a new plan at this time.');
        }
      });
  };

  return (
    <>
      <Animated.View
        style={styles.container(tintColor)}
        entering={animations.addPlan.addPlanView.entering()}
        exiting={animations.addPlan.addPlanView.exiting()}
        testID="addPlanView"
      >
        <View style={styles.headerContainer(tintColor)}>
          <Text style={styles.headerText(tintColor)}>
            {CONSTANT_STRINGS.PLANS.ADD_PLAN.PROMPT_TEXT(toBeItemTitle)}
          </Text>
        </View>
        <TextInput
          style={styles.input(tintColor)}
          onChangeText={(text) => setNewPlanTitle(text)}
          textAlign="center"
          selectionColor={tintColor}
          accessibilityLabel={CONSTANT_STRINGS.PLANS.ADD_PLAN.TEXT_INPUT_LABEL}
        />
      </Animated.View>
      <Animated.View
        style={styles.bottomButtonContainer}
        entering={animations.addPlan.addPlanView.entering()}
        exiting={animations.addPlan.addPlanView.exiting()}
      >
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={addPlan}
        >
          <Text style={styles.bottomButtonText}>Add</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: (tintColor) => ({
    justifyContent: 'flex-end',
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 6,
    padding: '3%',
    backgroundColor: colors.plans.planViewBackground,
    marginBottom: 12,
    borderColor: tintColor,
  }),
  headerContainer: (tintColor) => ({
    borderBottomWidth: 1.5,
    borderBottomColor: tintColor,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  }),
  input: (tintColor) => ({
    margin: 12,
    borderBottomWidth: 2,
    padding: 6,
    fontSize: 20,
    borderBottomColor: tintColor,
    color: tintColor,
  }),
  headerText: (tintColor) => ({
    color: tintColor,
    fontSize: 20,
    flexGrow: 1,
  }),
  bottomButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButton: {
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.general.defaultWhite,
    borderRadius: 8,
  },
  bottomButtonText: {
    fontSize: 16,
  },
});

export default AddPlan;
