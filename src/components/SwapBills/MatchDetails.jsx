import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import Header from '../Header';

// NOT BEING USED
const MatchDetails = ({ route, navigation }) => {
  const { match } = route.params;

  const handleAcceptSwap = () => {
    navigation.navigate('PaymentInformation');
  };

  return (
    <View style={styles.container}>
      <Header title="Match Details" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>User: {match.user}</Text>
        <Text style={styles.detailText}>Bill Type: {match.billType}</Text>
        <Text style={styles.detailText}>Terms: {match.terms}</Text>
        <Text style={styles.sectionTitle}>Negotiation</Text>
        {/* Add chat interface or predefined messages here */}
        <TextInput
          style={styles.input}
          placeholder="Type your message here"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptSwap}>
            <Text style={styles.buttonText}>Accept Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Decline Swap</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text>Step 1: Upload Bill | Step 2: Verify Details | Step 3: Find Matches | Step 4: Negotiate Swap | Step 5: Confirm Swap</Text>
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
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: '#5fa052',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: '#ff5c5c',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default MatchDetails;
