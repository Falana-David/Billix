import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../screens/Header';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <Text>Home Screen 🏠</Text>
      {/* Other content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
