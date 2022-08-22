/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import animations from '../utils/animations';
import colors from '../utils/colors';

const planLineContainerHeightCollapsed = 40;
const planLineContainerHeightExpanded = planLineContainerHeightCollapsed * 6;

function PlanRepeaterItem({ item }) {
  const [showDetailView, setShowDetailView] = useState(false);

  return (
    <Animated.View
      style={[styles.planLineContainer,
        showDetailView ? { height: planLineContainerHeightExpanded }
          : { height: planLineContainerHeightCollapsed },
      ]}
      entering={animations.plans.planItemForFlatList.entering}
      exiting={animations.plans.planItemForFlatList.exiting}
      layout={animations.plans.planItemForFlatList.layout}
    >
      <View
        style={styles.planLineHeaderContainer}
      >
        <TouchableOpacity
          style={styles.planLineHeader}
          key={item.repeater_id}
          onPress={() => setShowDetailView(!showDetailView)}
          onLongPress={() => Alert.alert('TODO: implement remove from repeater view here')}
        >
          <Text style={styles.planLineTitleText}>{item.plan_title}</Text>
        </TouchableOpacity>
        <MaterialIcons
          name={showDetailView ? 'expand-less' : 'expand-more'}
          size={22}
          color={colors.plans.textOrIconOnWhite}
          onPress={() => setShowDetailView(!showDetailView)}
        />
      </View>
      {showDetailView
        && (
          <Animated.View
            style={styles.planLineDetailContainer}
            entering={animations.plans.planItemForFlatList.entering}
            exiting={animations.plans.planItemForFlatList.exiting}
          >
            <View
              style={styles.planLineDetailFooter}
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={24}
                color={
                  item.repeater_shouldshowincalendar
                    ? colors.plans.textOrIconOnWhite
                    : colors.plans.disabledIcon
                }
                onPress={() => Alert.alert('add to calendar here')}
              />
            </View>
          </Animated.View>
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planLineContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: 4,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: colors.general.defaultWhite,
  },
  planLineHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  planLineHeader: {
    flex: 1,
    flexGrow: 1,
  },
  planLineDetailContainer: {
    flex: 8,
    alignItems: 'stretch',
  },
  planLineDetailFooter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  planLineTitleText: {
    fontSize: 16,
    color: colors.plans.textOrIconOnWhite,
  },
});

export default PlanRepeaterItem;
