import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { getAllToBeItems } from '../database/database';
import { Entypo } from '@expo/vector-icons';
import OptimisedToBeTile from '../components/optimisedToBeTile';

const defaultImageBackground = require('../../assets/beScreenBackground7.jpg');

function BeScreen({ navigation }) {
  const [allToBes, setAllToBes] = useState([]);
  const [isRetreiving, setIsRetreiving] = useState(false);

  const retreiveData = async () => {
    setAllToBes(await getAllToBeItems());
    setIsRetreiving(false);
  };

  const onRefresh = useCallback(() => {
    setIsRetreiving(true);
    retreiveData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
      // have to make sure we have empty dependency array here otherwise
      // the effect runs on every render
      // because arrays are compared by reference and even if the array contents haven't changed the
      // array will appear to have changed because it's a different reference
    }, [onRefresh]),
  );

  const renderOptimisedToBeTile = useCallback(({ item }) => (
    <OptimisedToBeTile
      toBeId={item.id}
      title={item.title}
      imageBackgroundUri={item.imageBackgroundUri}
      tintColor={item.tintColor}
      onDelete={onRefresh}
      navigation={navigation}
    />
  ), [navigation, onRefresh]);

  return (
    <ImageBackground source={defaultImageBackground} resizeMode='cover' style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <FlatList
          style={{width: "100%"}}
          data={allToBes}
          renderItem={renderOptimisedToBeTile}
          keyExtractor={(item) => item.id}
          numColumns={2}
          onRefresh={onRefresh}
          refreshing={isRetreiving}
        />
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddNewScreen")}>
          <Entypo name="add-to-list" size={24} color="black" />
        </TouchableOpacity>
        <StatusBar style={"auto"}/>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    x: 20,
    backgroundColor: 'white',
    position: 'absolute',
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 7
  },
  backgroundImage: {
    flex: 1,
  },
});

export default BeScreen;
