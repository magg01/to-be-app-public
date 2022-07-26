import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

export default AddPlan = (props) => {
  return (
    <View style={styles.container}>
      <Text>Add Plan Component</Text>
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
})