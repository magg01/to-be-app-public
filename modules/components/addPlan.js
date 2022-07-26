import React, { useRef, useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'

export default AddPlan = (props) => {

  const toBeId = useRef(props.toBeId);
  const [newPlanTitle, setNewPlanTitle] = useState('');

  return (
    <View style={styles.container}>
      <Text>Add Plan Component</Text>
      <TextInput style={styles.input} onChangeText={(text) => setNewPlanTitle(text)} />
      <Button title={'add plan'} onPress={() => {
            db.addPlan(newPlanTitle, toBeId)
            .then((success) => {
              if(success){
                db.getAllPlansByToBeId(toBeId)
                .then((plans) => setPlans(plans))
              } else {
                Alert.alert("Unable to add a new plan at this time.");
              }
            });
          }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  input: {
    width: "50%",
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    padding: 6,
    fontSize: 20,
    color: 'white'
  },
})