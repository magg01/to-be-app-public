/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import Animated from 'react-native-reanimated';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import animations from '../utils/animations';
import colors from '../utils/colors';

function PlanItem({ item, onDelete }) {
  const confirmDeletePlan = (planId) => {
    confirmDeleteAlert(
      'Are you sure?',
      'Data and notifications for your plan will be removed',
      () => onDelete(planId),
      null,
    );
  };

  return (
    <Animated.View
      style={styles.planLineContainer}
      entering={animations.plans.planItemForFlatList.entering}
      exiting={animations.plans.planItemForFlatList.exiting}
    >
      <TouchableOpacity
        style={styles.planLine}
        key={item.id}
        onPress={() => Alert.alert("open up here")}
        onLongPress={() => confirmDeletePlan(item.id)}
      >
        <Text style={{ color: colors.plans.textOrIconOnWhite }}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planLineContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    width: "100%",
    borderRadius: 4,
    marginBottom: 8,
    padding: 4,
    backgroundColor: colors.general.defaultWhite,
    opacity: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  planLine: {
    flex: 1,
    flexGrow: 1,
  },
});

export default PlanItem;
