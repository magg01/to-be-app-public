import React, {
  useEffect, useRef, useState,
} from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { deletePlanItemById, getAllPlansByToBeId, getPlansWithRepeaterPeriodicityByToBeId } from '../database/database';
import { MaterialIcons } from '@expo/vector-icons';
import animations from '../utils/animations';
import PlanItem from './planItem';
import colors from '../utils/colors';

function PlanView({providedToBeId, onAddNewPressed, tintColor, onRepeatersModified}) {
  const [expandedView, setExpandedView] = useState(true);
  const toBeId = useRef(providedToBeId);
  const [plansWithRepeaters, setPlansWithRepeaters] = useState(undefined);

  useEffect(() => {
    getPlansWithRepeaterPeriodicityByToBeId(toBeId.current)
      .then((result) => {
        setPlansWithRepeaters(result);
      });
  }, [toBeId, expandedView]);

  const onDeletePlan = (planId) => {
    // still need to delete all scheduled notifications on calEvents before deleting plan.
    deletePlanItemById(planId)
      .then((deleted) => {
        if (deleted) {
          onRepeatersModified('all');
          getPlansWithRepeaterPeriodicityByToBeId(toBeId.current)
            .then((result) => setPlansWithRepeaters(result));
        } else {
          Alert.alert('Not deleted');
        }
      });
  };

  return (
    <Animated.View
      style={[styles.container, {borderColor: tintColor}]}
      entering={animations.plans.planView.entering}
      exiting={animations.plans.planView.exiting}
      layout={animations.plans.planView.layout}
    >
      <View style={{borderBottomWidth: 1.5, borderBottomColor: tintColor, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start'}}>
        <Text style={{color: tintColor, fontSize: 20, flexGrow: 1}}>Plans</Text>
        <MaterialIcons
          name={expandedView ? "expand-less" : "expand-more"}
          size={22}
          color={tintColor}
          onPress={() => setExpandedView(!expandedView)}
        />
      </View>
      { expandedView
      && (
        <>
          <ScrollView>
            {plansWithRepeaters && plansWithRepeaters.map((item) => <PlanItem key={item.id} item={item} onDelete={onDeletePlan} onRepeaterModified={(repeaterType) => onRepeatersModified(repeaterType)} />)}
          </ScrollView>
          <Animated.View
            layout={animations.plans.planView.layout}
            entering={animations.plans.planView.entering}
            exiting={animations.plans.planView.exiting}
          >
            <TouchableOpacity style={styles.addButton} onPress={() => onAddNewPressed()}>
              <Entypo name="add-to-list" size={18} color={colors.plans.textOrIconOnWhite} />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxHeight: "75%",
    borderWidth: 1.5, 
    borderRadius: 6,
    padding: "3%",
    backgroundColor: 'rgba(200,200,200,0.2)',
    marginBottom: 12,
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
    backgroundColor: 'white',
  }
});

export default PlanView;
