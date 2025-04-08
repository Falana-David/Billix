import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ChatScreen = ({ route, navigation }) => {
  const { firstName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {firstName}!</Text>
      <Text style={styles.text}>Thank you for signing up.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    height: 50,
    backgroundColor: '#5fa052',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ChatScreen;
