import React, { useRef, useState, useEffect } from 'react';
import Animated from 'react-native-reanimated';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import animations from '../utils/animations';
import PlanRepeaterItem from './planRepeaterItem';
import colors from '../utils/colors';

function PlanRepeaterView({planRepeaters, tintColor, headerText, onRepeaterModified}) {
  const [expandedView, setExpandedView] = useState(true);

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
        <ScrollView
          nestedScrollEnabled
        >
          {planRepeaters
            && planRepeaters.map((item) => (
              <PlanRepeaterItem
                key={item.repeater_id}
                item={item}
                onRepeaterModified={onRepeaterModified}
              />
            ))}
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
