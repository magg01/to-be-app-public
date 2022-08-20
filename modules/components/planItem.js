/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert, TextInput, View} from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import animations from '../utils/animations';
import colors from '../utils/colors';

const planLineContainerHeightCollapsed = 40;
const planLineContainerHeightExpanded = planLineContainerHeightCollapsed * 6;

function PlanItem({ item, onDelete }) {
  const [showDetailView, setShowDetailView] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const confirmDeletePlan = (planId) => {
    confirmDeleteAlert(
      'Delete this plan?',
      'Data and notifications for your plan will be removed',
      () => onDelete(planId),
      null,
    );
  };

  return (
    <Animated.View
      style={[styles.planLineContainer,
        showDetailView ? { height: planLineContainerHeightExpanded }
          : { height: planLineContainerHeightCollapsed },
      ]}
      entering={animations.plans.planItemForFlatList.entering}
      exiting={animations.plans.planItemForFlatList.exiting}
    >
      <View
        style={showDetailView ? styles.planLineHeaderContainerExpanded : styles.planLineHeaderContainerCollapsed}
      >
        <TouchableOpacity
          style={styles.planLineHeader}
          key={item.id}
          onPress={() => Alert.alert(item.title)}
          onLongPress={() => confirmDeletePlan(item.id)}
        >
          <Text style={{ color: colors.plans.textOrIconOnWhite }}>{item.title}</Text>
        </TouchableOpacity>
        <MaterialIcons
          name={showDetailView ? "expand-less" : "expand-more"}
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
          >
            <TextInput
              style={{flex: 1, borderWidth: 1, borderColor: 'black', padding: 2}}
              placeholder={"Add more details here"}
              value={descriptionText}
              onChangeText={setDescriptionText}
              multiline
              textAlignVertical="top"
            />
          </Animated.View>
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planLineContainer: {
    borderWidth: 1,
    borderColor: 'red',
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: 4,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.general.defaultWhite,
    opacity: 1,
  },
  planLineHeaderContainerCollapsed: {
    flex: 1, 
    borderWidth: 1,
    borderColor: 'green',
    flexDirection: 'row',
  },
  planLineHeaderContainerExpanded: {
    flex: 1, 
    borderWidth: 1,
    borderColor: 'green',
    flexDirection: 'row',
  },
  planLineHeader: {
    flex: 1,
    flexGrow: 1,
  },
  planLineDetailContainer: {
    flex: 8,
    borderWidth: 1,
    borderColor: 'purple',
    alignItems: 'stretch',
  },
});

export default PlanItem;
