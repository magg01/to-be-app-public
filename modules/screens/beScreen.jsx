import React, { useCallback, useState } from 'react';
import {
  StyleSheet, FlatList, TouchableOpacity, ImageBackground, Text, View, InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Entypo } from '@expo/vector-icons';
import { getAllToBeItems } from '../database/database';
import ToBeTile from '../components/toBeTile';
import FocusAwareStatusBar from '../components/focusAwareStatusBar';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

const defaultImageBackground = require('../../assets/beScreenBackground7.jpg');

function BeScreen({ navigation }) {
  const [allToBes, setAllToBes] = useState([]);
  const [isRetreiving, setIsRetreiving] = useState(false);
  const headerHeight = useHeaderHeight();

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
      const task = InteractionManager.runAfterInteractions(() => {
        onRefresh();
      });
      return () => task.cancel();
    }, [onRefresh]),
  );

  const renderToBeTile = useCallback(({ item }) => (
    <ToBeTile
      toBeId={item.id}
      title={item.title}
      imageBackgroundUri={item.imageBackgroundUri}
      tintColor={item.tintColor}
      onDelete={onRefresh}
      navigation={navigation}
    />
  ), [navigation, onRefresh]);

  const renderListEmptyComponent = () => (
    <View style={styles.listEmptyContainer}>
      <Text style={styles.listEmptyText}>{CONSTANT_STRINGS.BE_SCREEN.LIST_EMPTY_MESSAGE}</Text>
    </View>
  );

  return (
    <ImageBackground
      style={styles.backgroundImage}
      source={defaultImageBackground}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container(headerHeight)}>
        <FlatList
          style={styles.mainFlatList}
          contentContainerStyle={styles.flatListContainer}
          data={allToBes}
          renderItem={renderToBeTile}
          keyExtractor={(item) => item.id}
          numColumns={2}
          onRefresh={onRefresh}
          refreshing={isRetreiving}
          ListEmptyComponent={renderListEmptyComponent}
        />
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddNewScreen")}>
          <Entypo name="add-to-list" size={24} color="black" />
        </TouchableOpacity>
        <FocusAwareStatusBar style="light" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: (headerHeight) => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: headerHeight / 2,
  }),
  mainFlatList: {
    width: '100%',
    marginTop: 8,
  },
  flatListContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8%',
  },
  listEmptyText: {
    color: colors.general.defaultWhite,
    fontSize: 26,
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
    backgroundColor: colors.general.defaultWhite,
    position: 'absolute',
    opacity: 0.9,
    shadowColor: colors.general.defaultBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 7,
  },
});

export default BeScreen;
