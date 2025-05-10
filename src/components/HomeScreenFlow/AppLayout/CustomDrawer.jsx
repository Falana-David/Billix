import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation } from 'react-native-navigation';

const CustomDrawer = (props) => {
  const navigateToScreen = (screenName) => {
    Navigation.push(props.parentComponentId, {
      component: {
        name: screenName,
      },
    });
    RNNDrawer.dismissDrawer();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateToScreen('Home')}>
        <Text style={styles.menuItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('Explore')}>
        <Text style={styles.menuItem}>Explore</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('Upload')}>
        <Text style={styles.menuItem}>Upload</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('Rewards')}>
        <Text style={styles.menuItem}>Rewards</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen('Profile')}>
        <Text style={styles.menuItem}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5fa052',
    padding: 20,
  },
  menuItem: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
  },
});

export default CustomDrawer;
