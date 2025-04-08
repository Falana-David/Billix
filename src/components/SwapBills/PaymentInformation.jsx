import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import Header from '../Header';

const PaymentInformation = ({ navigation }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const handleInputChange = (name, value) => {
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handleConfirmPayment = () => {
    // Add payment validation and processing logic here
    navigation.navigate('ConfirmationAndTracking');
  };

  return (
    <View style={styles.container}>
      <Header title="Payment Information" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Enter Payment Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          keyboardType="numeric"
          value={paymentDetails.cardNumber}
          onChangeText={(text) => handleInputChange('cardNumber', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Expiry Date"
          value={paymentDetails.expiryDate}
          onChangeText={(text) => handleInputChange('expiryDate', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="CVV"
          keyboardType="numeric"
          value={paymentDetails.cvv}
          onChangeText={(text) => handleInputChange('cvv', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Name on Card"
          value={paymentDetails.nameOnCard}
          onChangeText={(text) => handleInputChange('nameOnCard', text)}
        />
        <Button title="Confirm and Pay" onPress={handleConfirmPayment} />
      </View>
      <View style={styles.footer}>
        <Text>Step 1: Upload Bill | Step 2: Verify Details | Step 3: Find Matches | Step 4: Negotiate Swap | Step 5: Confirm Swap | Step 6: Payment</Text>
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
  formContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default PaymentInformation;
