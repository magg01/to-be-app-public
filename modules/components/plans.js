import React, {useEffect, useRef, useState} from 'react';
import Animated from 'react-native-reanimated';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { deletePlanItemById, getAllPlansByToBeId } from '../database/database';
import { animations } from '../utils/animations';

export default PlanView = (props) => {
  const toBeId = useRef(props.toBeId).current
  const [plans, setPlans] = useState(undefined)

  useEffect(() => {
    getAllPlansByToBeId(toBeId).then(result => setPlans(result))
  }, [toBeId])

  const PlanItemForFlatList = ({plan}) => {
    return (
      <Animated.View 
        style={{flex: 1}} 
        entering={animations.plans.planItemForFlatList.entering}
      >
        <TouchableOpacity key={plan.id} style={styles.planLine} onPress={() => deletePlan(plan.id)}>
          <Text style={{color:'rgba(75,75,75,1)'}}>{plan.title}</Text>
        </TouchableOpacity> 
      </Animated.View>
    )
  }

  const deletePlan = (id) => {
    //still need to delete all scheduled notifications on calEvents before deleting plan.
    deletePlanItemById(id).then((deleted) => {
      deleted ? getAllPlansByToBeId(toBeId).then((result) => setPlans(result)) : Alert.alert("Not deleted")
    })
  }

  return (
    <Animated.View 
      style={styles.container}
      entering={animations.plans.planView.entering} 
      exiting={animations.plans.planView.exiting} 
    >
      <Text style={{color: 'white', borderBottomWidth: 1, borderBottomColor: 'white', marginBottom: 8, fontSize: 20}}>Plans</Text>
      <FlatList
        renderItem={({item}) => <PlanItemForFlatList plan={item} />}
        data={plans} 
        keyExtractor={item => item.id} 
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: 'flex-start',
    maxHeight: "50%",
    minHeight: "15%",
    borderWidth: 1.5, 
    borderColor: 'white', 
    borderRadius: 6,
    padding: "3%",
    backgroundColor: 'rgba(200,200,200,0.2)',
  },
  planLine: {
    width: "100%",
    height: 40,
    borderRadius: 4,
    marginBottom: 8,
    padding: 4,
    backgroundColor: 'white',
    opacity: 1,
    justifyContent: 'center',
  },
})
