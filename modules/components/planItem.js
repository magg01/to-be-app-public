/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import animations from '../utils/animations';
import colors from '../utils/colors';

function PlanItem({ item }) {
  return (
    <Animated.View
      style={styles.container}
      entering={animations.plans.planItemForFlatList.entering}
      exiting={animations.plans.planItemForFlatList.exiting}
    >
      <TouchableOpacity
        key={item.id}
        style={styles.planLine}
        onPress={() => Alert.alert("open up here")}
        onLongPress={() => confirmDeletePlan(item.id)}
      >
        <Text style={{ color: colors.plans.textOrIconOnWhite }}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  planLine: {
    height: 40,
    borderRadius: 4,
    marginBottom: 8,
    padding: 4,
    backgroundColor: 'white',
    opacity: 1,
    justifyContent: 'center',
  },
});

export default PlanItem;
