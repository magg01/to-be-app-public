/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import animations from '../utils/animations';
import colors from '../utils/colors';
import { getPreviousPeriodReset } from '../utils/datetime';
import { updateLastDoneDateTimeOnRepeaterByRepeaterId } from '../database/database';

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
            onPress={() => setShowDetailView(!showDetailView)}
            onLongPress={() => Alert.alert('TODO: implement remove from repeater view here')}
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
            onPress={() => {
              setIsDoneForNow(!isDoneForNow);
              if (isDoneForNow) {
                updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, null)
                  .then((updated) => {
                    if (updated) onRepeaterModified();
                  })
              } else {
                updateLastDoneDateTimeOnRepeaterByRepeaterId(item.repeater_id, (new Date()).toISOString())
                  .then((updated) => {
                    if (updated) onRepeaterModified();
                  });
              }
            }}
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
