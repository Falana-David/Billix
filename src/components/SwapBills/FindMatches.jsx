import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

const FindMatches = ({ navigation }) => {
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    // Simulate a search completion
    setTimeout(() => {
      setSearchDone(true);
    }, 5000); // Adjust time as needed for your use case
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      {searchDone ? (
        <>
          <Text style={styles.headerText}>Searching Done</Text>
          <Text style={styles.subText}>You will be notified soon.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.headerText}>Finding Matches</Text>
          <Text style={styles.subText}>We are now searching for the best matches for your bill.</Text>
          <Text style={styles.infoText}>Service: PSEG</Text>
          <Text style={styles.infoText}>Due Date: 09/18/2024</Text>
          <Text style={styles.infoText}>Urgent: Yes</Text>
          <ActivityIndicator size="large" color="#4A7C59" />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3FCE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A7C59',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default FindMatches;
