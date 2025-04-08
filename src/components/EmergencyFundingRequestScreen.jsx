import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import Header from '../components/Header';

const EmergencyFundingRequestScreen = ({ navigation }) => {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [needByDate, setNeedByDate] = useState('');
  const [email, setEmail] = useState('');
  const [caseNumber, setCaseNumber] = useState(`EF-${Math.floor(Math.random() * 1000000)}`);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAmountChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, ''); // Removes any non-numeric characters
    setAmount(numericValue);
  };

  const handleDateChange = (value) => {
    let formattedDate = value.replace(/[^0-9]/g, '');

    if (formattedDate.length >= 3 && formattedDate.length <= 4) {
      formattedDate = `${formattedDate.slice(0, 2)}/${formattedDate.slice(2)}`;
    } else if (formattedDate.length > 4) {
      formattedDate = `${formattedDate.slice(0, 2)}/${formattedDate.slice(2, 4)}/${formattedDate.slice(4)}`;
    }

    setNeedByDate(formattedDate);
  };

  const handleSubmit = async () => {
    if (!amount || !email || !needByDate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const requestData = {
      reason,
      amount,
      need_by_date: needByDate,
      email,
      case_number: caseNumber,
    };

    try {
      const response = await fetch('https://your-backend-url/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert('Request Sent', 'Your emergency funding request has been submitted. We will get back to you shortly.', [
          {
            text: 'Close',
            onPress: () => navigation.navigate('Home', { caseNumber }),
          },
        ]);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an issue submitting your request. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <View style={styles.circleButton}>
          <Text style={styles.backButtonText}>&larr;</Text>
        </View>
      </TouchableOpacity>

      {/* Logo and Title */}
      <View style={styles.logoTitleContainer}>
        <Text style={styles.pageTitle}>Emergency Funding Request</Text>
      </View>

      {/* Learn More Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Learn More</Text>
            <Text style={styles.modalText}>
              This page allows you to request emergency funding by providing details about your situation.
              Please fill out the form accurately to increase your chances of receiving the funds you need.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Why do you need the money?</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe your situation..."
          multiline
          value={reason}
          onChangeText={setReason}
        />

        <Text style={styles.label}>How much money do you need?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange}
        />

        <Text style={styles.label}>When do you need the money by?</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          value={needByDate}
          onChangeText={handleDateChange}
          maxLength={10} // Ensures the date format is correct
        />

        <Text style={styles.label}>Your Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.learnMoreButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.learnMoreText}>Learn More</Text>
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
  backButton: {
    padding: 10,
    margin: 10,
    alignSelf: 'flex-start',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoTitleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    color: '#4A7C59',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4A7C59',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
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
  learnMoreButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#4A7C59',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    margin: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4A7C59',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default EmergencyFundingRequestScreen;
