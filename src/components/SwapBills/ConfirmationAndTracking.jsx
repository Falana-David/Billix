import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../Header';

const ConfirmationAndTracking = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Confirmation and Tracking" />
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Your swap has been confirmed!</Text>
        <Text style={styles.detailText}>We will notify you about the status of your swap via email and in-app notifications.</Text>
        
        <TouchableOpacity style={styles.trackButton} onPress={() => navigation.navigate('TrackSwap')}>
          <Text style={styles.trackButtonText}>Track Swap</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Step 1: Upload Bill | Step 2: Verify Details | Step 3: Find Matches | Step 4: Negotiate Swap | Step 5: Confirm Swap | Step 6: Payment | Step 7: Tracking</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#5fa052',
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  trackButton: {
    backgroundColor: '#5fa052',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  trackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default ConfirmationAndTracking;
