import React, { useState, useContext } from 'react';
import {
  View,
  Button,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe, PaymentSheetError } from '@stripe/stripe-react-native';
import { UserContext } from '../../UserContext';

const getApiEndpoint = () => {
    if (Platform.OS === 'ios') return 'http://127.0.0.1:5000';           // iOS Simulator
    if (Platform.OS === 'android') return 'http://10.0.2.2:5000';         // Android Emulator
    return 'http://192.168.1.100:5000'; // Fallback for physical devices (replace with your real IP)
  };
  

const CoPilotRequest = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Missing user token');

      // Step 1: Create Stripe customer — no body needed, just JWT auth
      const customerRes = await fetch(`${getApiEndpoint()}/create-customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!customerRes.ok) throw new Error('Failed to create customer');
      const { customerId } = await customerRes.json();

      // Step 2: Create subscription with Stripe price ID
      const subscriptionRes = await fetch(`${getApiEndpoint()}/create-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId: 'price_1RnMWARre8MwPufwgpeoARQt', // Replace with your actual Stripe Price ID
        }),
      });

      if (!subscriptionRes.ok) throw new Error('Failed to create subscription');
      const { clientSecret } = await subscriptionRes.json();

      // Step 3: Init Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        returnURL: 'billix://payment-complete', // Adjust this to your scheme
        allowsDelayedPaymentMethods: true,
      });

      if (initError) throw new Error(initError.message);

      // Step 4: Present the payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === PaymentSheetError.Canceled) {
          Alert.alert('Payment cancelled');
        } else {
          Alert.alert('Payment failed', presentError.message);
        }
      } else {
        Alert.alert('Success', 'Subscription completed!');
        navigation.navigate('SubscriptionSuccess');
      }

    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 80 }}>
      <Button
        title={loading ? 'Processing...' : 'Subscribe to Co-Pilot'}
        onPress={handleSubscribe}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

export default CoPilotRequest;
