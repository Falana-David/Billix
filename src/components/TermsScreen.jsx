import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TermsScreen = ({ route, navigation }) => {
  const { firstName, lastName, birthday, email, phoneNumber, state, cardNumber } = route.params;

  const handleAccept = () => {
    // Process user data, e.g., save to database
    // After processing, navigate to welcome screen
    navigation.navigate('Welcome', {
      firstName,
      lastName,
      birthday,
      email,
      phoneNumber,
      state,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms and Conditions</Text>
      <Text style={styles.text}>[Insert lengthy terms and conditions here]</Text>
      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  button: {
    height: 50,
    backgroundColor: '#5fa052',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TermsScreen;
