/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import animations from '../utils/animations';
import colors from '../utils/colors';
import { confirmDeleteAlert } from '../utils/deleteConfirmation';
import { getPreviousPeriodReset } from '../utils/datetime';
import { updateLastDoneDateTimeOnRepeaterByRepeaterId, deleteRepeaterByPlanId } from '../database/database';
import CONSTANT_STRINGS from '../strings/constantStrings';

const planLineContainerHeightCollapsed = 40;

function PlanRepeaterItem({ item, onRepeaterModified }) {
  const [isDoneForNow, setIsDoneForNow] = useState(false);

  useEffect(() => {
    // if the repeaterItem has no lastdonedatetime then it is not complete
    if (item.repeater_lastdonedatetime === null) {
      setIsDoneForNow(false);
    // if the repeaterItem has a lastdonedatetime
    } else {
      // find out the previous reset datetime from now
      const previousPeriodReset = getPreviousPeriodReset(item.repeater_periodicity);
      // check if the lastdonedatetime is >= the previous period reset
      if (new Date(item.repeater_lastdonedatetime) >= previousPeriodReset) {
        // then it is done for now
        setIsDoneForNow(true);
      } else {
        // if it is < the previous period reset
        // then it needs doing again
        setIsDoneForNow(false);
      }
    }
  }, [item.repeater_lastdonedatetime, item.repeater_periodicity]);

  const confirmDeleteThisRepeaterItem = () => {
    confirmDeleteAlert(
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_MAIN_TITLE,
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_DESCRIPTION,
      () => {
        deleteRepeaterByPlanId(item.plan_id)
          .then(() => {
            onRepeaterModified();
          });
      },
      () => null,
      CONSTANT_STRINGS.PLANS.REPEATERS.REMOVE_ALERT_CONFIRM_BUTTON_TITLE,
    );
  };

  const updateIsDoneForNow = () => {
    if (isDoneForNow) {
      setIsDoneForNow(!isDoneForNow);
      updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, null)
        .then((updated) => {
          if (updated) onRepeaterModified();
        });
    } else {
      setIsDoneForNow(!isDoneForNow);
      updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, (new Date()).toISOString())
        .then((updated) => {
          if (updated) onRepeaterModified();
        });
      Toast.show({
        type: 'info',
        text1: CONSTANT_STRINGS.PLANS.REPEATERS.COMPLETION_TOAST_HEADER(),
        text2: CONSTANT_STRINGS.PLANS.REPEATERS.COMPLETION_TOAST_CONTENT(item.repeater_periodicity),
      });
    }
  };

  return (
    // unfortunately the opacity based on state does not work on an animated view,
    // at least not on initial render, so we need this outer container to
    // dynamically set the opacity based on state from first render on.
    <View style={styles.opacityOverlay(isDoneForNow)}>
      <Animated.View
        style={[styles.planLineContainer]}
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
            onPress={updateIsDoneForNow}
            onLongPress={confirmDeleteThisRepeaterItem}
          >
            <Text style={styles.planLineTitleText(isDoneForNow)}>{item.plan_title}</Text>
          </TouchableOpacity>
          <MaterialCommunityIcons
            name={
              isDoneForNow
                ? 'checkbox-marked-circle-outline'
                : 'checkbox-blank-circle-outline'
            }
            size={22}
            color={colors.plans.textOrIconOnWhite}
            onPress={updateIsDoneForNow}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  opacityOverlay: (isDoneForNow) => ({
    opacity: isDoneForNow ? 0.3 : 1,
  }),
  planLineContainer: {
    flex: 1,
    width: '100%',
    height: planLineContainerHeightCollapsed,
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
  planLineTitleText: (isDoneForNow) => ({
    fontSize: 16,
    color: colors.plans.textOrIconOnWhite,
    textDecorationLine: isDoneForNow ? 'line-through' : null,
  }),
});

export default PlanRepeaterItem;
