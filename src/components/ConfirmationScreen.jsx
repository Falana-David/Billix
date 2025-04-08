import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

const ConfirmationScreen = ({ route, navigation }) => {
  const { caseNumber } = route.params;

  return (
    <View style={styles.container}>
      <Header title="Request Sent" />
      <View style={styles.contentContainer}>
        <Text style={styles.message}>Your emergency funding request has been sent!</Text>
        <Text style={styles.caseNumber}>Case Number: {caseNumber}</Text>
        <Text style={styles.subMessage}>We will review your request and get back to you shortly.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8EC',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 20,
    textAlign: 'center',
  },
  caseNumber: {
    fontSize: 18,
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: '#4A7C59',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConfirmationScreen;
