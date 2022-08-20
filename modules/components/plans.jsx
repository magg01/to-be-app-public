import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import Animated, { color } from 'react-native-reanimated';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { deletePlanItemById, getAllPlansByToBeId } from '../database/database';
import animations from '../utils/animations';
import PlanItem from './planItem';
import colors from '../utils/colors';

function PlanView({providedToBeId, onAddNewPressed, tintColor}) {
  const toBeId = useRef(providedToBeId);
  const [plans, setPlans] = useState(undefined);

  useEffect(() => {
    getAllPlansByToBeId(toBeId.current)
      .then((result) => setPlans(result));
  }, [toBeId]);

  const onDeletePlan = (planId) => {
    // still need to delete all scheduled notifications on calEvents before deleting plan.
    deletePlanItemById(planId)
      .then((deleted) => {
        if (deleted) {
          getAllPlansByToBeId(toBeId.current)
            .then((result) => setPlans(result));
        } else {
          Alert.alert('Not deleted');
        }
      });
  };

  const renderPlanItem = ({ item }) => (
    <PlanItem item={item} onDelete={onDeletePlan} />
  );

  return (
    <Animated.View
      style={[styles.container, {borderColor: tintColor}]}
      entering={animations.plans.planView.entering}
      exiting={animations.plans.planView.exiting}
      layout={animations.plans.planView.layout}
    >
      <View style={{borderBottomWidth: 1.5, borderBottomColor: tintColor, marginBottom: 8}}>
        <Text style={{color: tintColor, fontSize: 20}}>Plans</Text>
      </View>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanItem}
      />
      <Animated.View
        layout={animations.plans.planView.layout}
      >
        <TouchableOpacity style={styles.addButton} onPress={() => onAddNewPressed()}>
          <Entypo name="add-to-list" size={18} color={colors.plans.textOrIconOnWhite} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxHeight: "75%",
    minHeight: "15%",
    borderWidth: 1.5, 
    borderRadius: 6,
    padding: "3%",
    backgroundColor: 'rgba(200,200,200,0.2)',
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
});

export default PlanView;
