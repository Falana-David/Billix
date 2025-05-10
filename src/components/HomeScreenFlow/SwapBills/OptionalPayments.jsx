import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

const OptionalPayments = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bill, matchData } = route.params || {};
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState({
    insurance: false,
    speedBoost: false,
    publicPost: false,
  });
  

  const toggleAddOn = (type) => {
    setSelectedAddOns((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const getTotalAmount = () => {
    let total = 0;
    if (selectedAddOns.insurance) total += 2.49;
    if (selectedAddOns.speedBoost) total += 1.49;
    if (selectedAddOns.publicPost) total += 3.99;
    return total;
  };
  console.log('✅ route.params:', route.params);
  console.log('✅ matchData:', matchData);
  
  const handleContinue = async () => {
    const totalAmount = getTotalAmount();
    const token = await AsyncStorage.getItem('token');

    const fullBill = {
      ...bill,
      bill_type: bill?.bill_type || 'Unknown',
      swappable_amount: bill?.swappable_amount || 0,
      due_date: bill?.due_date || new Date().toISOString().split('T')[0],
    };

    // If nothing selected, skip to match
    if (totalAmount === 0) {
      console.log("✅ Skipping payment. Navigating with bill:", fullBill);
      navigation.navigate('FindMatches', { bill: fullBill, addOns: selectedAddOns });
      return;
    }

    if (!matchData?.payee_id) {
        Alert.alert("Missing User Info", "Cannot proceed without user info.");
        return;
      }
      
      

    setLoading(true);
    const amountInCents = Math.round(totalAmount * 100);

    try {
      const response = await fetch('http://127.0.0.1:5000/payment-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountInCents,
          payee_id: matchData.payee_id,
          swap_id: matchData.swap_id,
          add_ons: selectedAddOns,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Payment Error', errorData?.error || 'Failed to get payment sheet');
        setLoading(false);
        return;
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      const { error: initError } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Billix',
        returnURL: 'billix://home',
      });

      if (initError) {
        Alert.alert('Stripe Error', initError.message);
        setLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert('Payment Cancelled', 'You can continue without purchasing add-ons.');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Your add-ons were successfully purchased!');
      if (selectedAddOns.publicPost) {
        try {
          await fetch('http://127.0.0.1:5000/mark-public', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ bill_id: fullBill.id }),
          });
        } catch (err) {
          console.warn('Failed to mark bill public:', err);
        }
      }
      
      navigation.navigate('FindMatches', { bill: fullBill, addOns: selectedAddOns });

    } catch (error) {
      Alert.alert('Unexpected Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enhance Your Billix Experience</Text>
      <Text style={styles.subtext}>Choose optional add-ons to increase your match success. You can also skip.</Text>

      {bill?.amount_due && !isNaN(parseFloat(bill.amount_due)) && (
        <View style={styles.swappableBox}>
          <Text style={styles.swappableText}>
            You've uploaded a ${parseFloat(bill.amount_due).toFixed(2)} bill.
            {'\n'}Up to <Text style={styles.highlight}>$50</Text> is eligible for swapping.
          </Text>
        </View>
      )}

<TouchableOpacity
  style={[
    styles.card,
    selectedAddOns.publicPost && styles.cardSelected,
    styles.mostPopularCard,
  ]}
  onPress={() => toggleAddOn('publicPost')}
>
  <View style={styles.cardBadge}>
    <Text style={styles.cardBadgeText}>Most Popular</Text>
  </View>
  <Text style={styles.cardTitle}>Post Publicly</Text>
  <Text style={styles.cardDesc}>Add your bill to the public feed. <Text style={styles.price}>$3.99</Text></Text>
</TouchableOpacity>


      <TouchableOpacity
        style={[styles.card, selectedAddOns.insurance && styles.cardSelected]}
        onPress={() => toggleAddOn('insurance')}
      >
        <Text style={styles.cardTitle}>Bill Insurance</Text>
        <Text style={styles.cardDesc}>Protect your swap in case it falls through. $2.49</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selectedAddOns.speedBoost && styles.cardSelected]}
        onPress={() => toggleAddOn('speedBoost')}
      >
        <Text style={styles.cardTitle}>Boost Match Speed</Text>
        <Text style={styles.cardDesc}>Get priority placement in our matching algorithm. $1.49</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueBtnText}>
            {getTotalAmount() > 0
              ? `Pay $${getTotalAmount().toFixed(2)} & Continue`
              : 'Skip & Continue'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  swappableBox: {
    backgroundColor: '#E6F4EA',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  swappableText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: '#4A7C59',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#4A7C59',
    backgroundColor: '#E6F4EA',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  continueBtn: {
    marginTop: 10,
    backgroundColor: '#4A7C59',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mostPopularCard: {
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  
  cardBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4A7C59',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    zIndex: 2,
  },
  
  cardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  price: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  
});

export default OptionalPayments;
