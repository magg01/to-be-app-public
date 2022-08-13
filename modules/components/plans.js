import React, {useEffect, useRef, useState, useCallback} from 'react';
import Animated, { Layout, ZoomIn } from 'react-native-reanimated';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { deletePlanItemById, getAllPlansByToBeId } from '../database/database';
import { animations } from '../utils/animations';

export default PlanView = (props) => {
  const toBeId = useRef(props.toBeId).current
  const refreshing = useRef(false);
  const [plans, setPlans] = useState(undefined);

  useEffect(() => {
    if(plans != undefined){
      refreshing.current = false;
    }
  }, [plans])

  useEffect(() => {
    getAllPlansByToBeId(toBeId).then(result => {
      setPlans(result)
    })
  }, [toBeId])


  const deletePlan = useCallback((id) => {
    //still need to delete all scheduled notifications on calEvents before deleting plan.
    deletePlanItemById(id).then((deleted) => {
      if(deleted){
        // refreshing.current = true;
        setPlans(currentPlans => {
          return currentPlans.filter(item => item.id != id)
        })
      } else {
        Alert.alert("Not deleted")
      }
    })
  }, [plans])


  return (
    <Animated.View 
      style={styles.container}
      entering={animations.plans.planView.entering} 
      exiting={animations.plans.planView.exiting}
      layout={animations.plans.planView.layout}
    >
      <View style={{borderBottomWidth: 1.5, borderBottomColor: 'white', marginBottom: 8}}>
        <Text style={{color: 'white', fontSize: 20}}>Plans</Text>
      </View>
      <FlatList
        data={plans} 
        keyExtractor={item => item.id} 
        renderItem={({item}) => {
          return (
            <Animated.View 
              style={{flex: 1}} 
              entering={animations.plans.planItemForFlatList.entering}
              exiting={animations.plans.planItemForFlatList.exiting}
            >
              <TouchableOpacity key={item.id} style={styles.planLine} onPress={() => deletePlan(item.id)}>
                <Text style={{color:'rgba(75,75,75,1)'}}>{item.title}</Text>
              </TouchableOpacity> 
            </Animated.View>
          )
        }}
      />
      <Animated.View
        layout={animations.plans.planView.layout}  
      >
        <TouchableOpacity style={styles.addButton} onPress={() => props.onAddNewPressed()}>
          <Text>new</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    
    maxHeight: "75%",
    minHeight: "15%",
    borderWidth: 1.5, 
    borderColor: 'white', 
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
})
