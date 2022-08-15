import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { getAllToBeItems } from '../database/database';
import ToBeTile from '../components/toBeTile';

function BeScreen({ navigation }) {
  const [allToBes, setAllToBes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const toBes = await getAllToBeItems();
        setAllToBes(toBes)
      })();
      // have to make sure we have empty dependency array here otherwise
      // the effect runs on every render
      // because arrays are compared by reference and even if the array contents haven't changed the
      // array will appear to have changed because it's a different reference
    }, []),
  );

  const renderToBeTile = ({ item }) => (
    <ToBeTile
      key={item.id}
      toBeId={item.id}
      onPress={() => {
        navigation.navigate('ViewToBeScreen', { toBeId: item.id });
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{width: "100%"}}
        data={allToBes}
        renderItem={renderToBeTile}
        keyExtractor={item => item.id}
        numColumns={2}
      />
      <StatusBar style={"auto"}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BeScreen;
