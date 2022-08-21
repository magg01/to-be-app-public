import React, { useRef, useState, useEffect } from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllPlanRepeatersByTypeAndToBeId } from '../database/database';
import animations from '../utils/animations';
import PlanRepeaterItem from './planRepeaterItem';
import colors from '../utils/colors';

function PlanRepeaterView({providedToBeId, tintColor, repeaterType, headerText}) {
  const [expandedView, setExpandedView] = useState(true);
  const toBeId = useRef(providedToBeId);
  const [planRepeaters, setPlanRepeaters] = useState(undefined);

  useEffect(() => {
    getAllPlanRepeatersByTypeAndToBeId(toBeId.current, repeaterType)
      .then((result) => setPlanRepeaters(result));
  }, [repeaterType, toBeId]);

  return (
    <Animated.View
      style={styles.outerContainer(tintColor)}
      entering={animations.plans.planView.entering}
      exiting={animations.plans.planView.exiting}
      layout={animations.plans.planView.layout}
    >
      <View style={styles.headerContainer(tintColor)}>
        <Text style={styles.headerText(tintColor)}>{headerText}</Text>
        <MaterialIcons
          name={expandedView ? 'expand-less' : 'expand-more'}
          size={22}
          color={tintColor}
          onPress={() => setExpandedView(!expandedView)}
        />
      </View>
      {expandedView
      && (
        <ScrollView>
          {planRepeaters
            && planRepeaters.map((item) => <PlanRepeaterItem key={item.id} item={item} />)}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: (tintColor) => ({
    width: '100%',
    maxHeight: '75%',
    borderWidth: 1.5,
    borderRadius: 6,
    borderColor: tintColor,
    padding: '3%',
    backgroundColor: colors.plans.planViewBackground,
    marginBottom: 12,
  }),
  headerContainer: (tintColor) => ({
    borderBottomWidth: 1.5,
    borderBottomColor: tintColor,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  }),
  headerText: (tintColor) => ({
    color: tintColor,
    fontSize: 20,
    flexGrow: 1,
  }),
});

export default PlanRepeaterView;
