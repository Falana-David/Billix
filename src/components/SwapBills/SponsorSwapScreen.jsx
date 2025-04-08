import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import Header from '../Header';

const SponsorSwapScreen = ({ navigation }) => {
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSponsorSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const paymentResponse = await fetch('http://127.0.0.1:5000/payment-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure token is being sent
        },
        body: JSON.stringify({ amount: sponsorAmount * 100 }), // amount in cents
      });

      if (!paymentResponse.ok) {
        const paymentResponseData = await paymentResponse.json();
        Alert.alert('Error', paymentResponseData.error);
        return;
      }

      const { paymentIntent, ephemeralKey, customer, publishableKey } = await paymentResponse.json();

      const { error } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Your App Name',
        returnURL: 'yourapp://home',
      });

      if (!error) {
        setModalVisible(true);
        setLoading(false);
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert(`Error code: ${presentError.code}`, presentError.message);
        } else {
          Alert.alert('Success', 'Your payment is confirmed!');
          setCompleted(true);
        }
      } else {
        Alert.alert('Error', 'Failed to initialize payment sheet. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment sheet. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Sponsor A Swap" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.introSection}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={require('../assets/circle-left-regular.png')} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <Text style={styles.introTitle}>Sponsor A Swap</Text>
          </View>
          <Text style={styles.introDescription}>
            By sponsoring a swap, you can help others pay off their bills using your leftover money. Simply enter the amount you want to sponsor below.
          </Text>
          <View style={styles.howItWorks}>
            <Text style={styles.howItWorksTitle}>How It Works</Text>
            <View style={styles.videoPlaceholder}>
              <Text>Video/Animation Placeholder</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={sponsorAmount}
            onChangeText={setSponsorAmount}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSponsorSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A7C59" />
            </View>
          )}
          {completed && (
            <View style={styles.completedContainer}>
              <Image source={require('../assets/circle-left-regular.png')} style={styles.checkIcon} />
              <Text style={styles.completedText}>Transfer Complete!</Text>
              <Text style={styles.completedSubText}>We will notify you of the swap soon.</Text>
              <TouchableOpacity style={styles.doneButton} onPress={() => {
                setModalVisible(false);
                setCompleted(false);
                navigation.navigate('Home');
              }}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    tintColor: '#4A7C59',
  },
  scrollContainer: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
    flex: 1,
  },
  introDescription: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    borderColor: '#4A7C59',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  howItWorks: {
    marginBottom: 20,
    alignItems: 'center',
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  videoPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkIcon: {
    width: 50,
    height: 50,
    tintColor: '#4A7C59',
    marginBottom: 20,
  },
  completedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  completedSubText: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SponsorSwapScreen;
