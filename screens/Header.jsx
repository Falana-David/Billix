import React from 'react';
import { View, StyleSheet } from 'react-native';

const Header = () => {
  return <View style={styles.header} />;
};

const styles = StyleSheet.create({
  header: {
    height: 50, // Adjust height as needed
    backgroundColor: '#5fa052',
    width: '100%',
  },
});

export default Header;
