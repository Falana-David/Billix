import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const data = [
  { id: 1, title: 'Sample Item 1', image: require('./assets/logo.png') },
  { id: 2, title: 'Sample Item 2', image: require('./assets/logo.png') },
  { id: 3, title: 'Sample Item 3', image: require('./assets/logo.png') },
];

const Carousel = () => {
  return (
    <FlatList
      data={data}
      horizontal
      pagingEnabled
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <Image source={item.image} style={styles.itemImage} />
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Carousel;
