// OptionalPayments.js (Updated)
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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState({
    powerReport: false, // <-- Power Report
    boostSpeed: false,
    postPublicly: false,
    premiumCoPilot: false, // <-- Co-Piolt Acess
  });
  const [step, setStep] = useState(0);
  const [billInfo, setBillInfo] = useState({
    frequency: '',
    urgent: '',
    description: '',
    visibility: '',
  });

  const toggleAddOn = (type) => {
    setSelectedAddOns((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const getTotalAmount = () => {
    let total = 0;
    if (selectedAddOns.powerReport) total += 3.99;
    if (selectedAddOns.boostSpeed) total += 1.49;
    if (selectedAddOns.postPublicly) total += 0.00;
    if (selectedAddOns.premiumCoPilot) total += 4.99; // <-- new price
    return total;
  };  

  const handleContinue = async () => {
    const totalAmount = getTotalAmount();
    const token = await AsyncStorage.getItem('token');

    const fullBill = {
      ...bill,
      bill_type: bill?.bill_type || 'Unknown',
      swappable_amount: bill?.swappable_amount || 0,
      due_date: bill?.due_date || new Date().toISOString().split('T')[0],
    };

    if (totalAmount === 0) {
      navigation.navigate('FindMatches', { bill: fullBill, addOns: selectedAddOns });
      return;
    }

    if (!matchData?.payee_id) {
      Alert.alert('Missing User Info', 'Cannot proceed without user info.');
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

      if (selectedAddOns.postPublicly) {
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

      {/* Power Report Upsell */}
      <TouchableOpacity
        style={[styles.card, selectedAddOns.powerReport && styles.cardSelected]}
        onPress={() => toggleAddOn('powerReport')}
      >
                <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>Most Popular</Text>
        </View>
        <Text style={styles.cardTitle}>Unlock Power Report</Text>
        <Text style={styles.cardDesc}>Get hidden trends, overcharges, and expert tactics. <Text style={styles.price}>$3.99</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selectedAddOns.boostSpeed && styles.cardSelected]}
        onPress={() => toggleAddOn('boostSpeed')}
      >
        <Text style={styles.cardTitle}>Speed Boost</Text>
        <Text style={styles.cardDesc}>Get priority matching and faster results. <Text style={styles.price}>$1.49</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selectedAddOns.postPublicly && styles.cardSelected, styles.mostPopularCard]}
        onPress={() => toggleAddOn('postPublicly')}
      >

        <Text style={styles.cardTitle}>Post to Billix Feed</Text>
        <Text style={styles.cardDesc}>Let others discover and support your bill. <Text style={styles.price}>$0.00</Text></Text>
      </TouchableOpacity>

      {/* Co-Pilot CTA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Need Help Navigating?</Text>
        <Text style={styles.cardDesc}>Get matched with a Billix Co-Pilot for free support. Premium Co-Pilots also available.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CoPilotRequest')}>
          <Text style={styles.price}>Request Free Co-Pilot</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.card, selectedAddOns.premiumCoPilot && styles.cardSelected]}
          onPress={() => toggleAddOn('premiumCoPilot')}
        >
          <Text style={styles.cardTitle}>Get Premium Co-Pilot</Text>
          <Text style={styles.cardDesc}>
            1-on-1 help from expert Billix Co-Pilots. Includes strategy, negotiation tips, and more.
            <Text style={styles.price}> $4.99</Text>
          </Text>
        </TouchableOpacity> */}

      </View>

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
        {showPremiumModal && (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Premium Co-Pilot Guidance</Text>
        <Text style={styles.modalText}>
          Get 1-on-1 help from our most experienced Billix Co-Pilots.
          Premium Co-Pilots can assist with bill strategy, negotiation tips,
          and long-term financial planning.
        </Text>
        <TouchableOpacity onPress={() => setShowPremiumModal(false)} style={styles.modalClose}>
          <Text style={styles.modalCloseText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}

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
  insightBox: {
    backgroundColor: '#F8FFF7',
    borderColor: '#4A7C59',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 8,
  },
  insightItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
    color: '#1C3D2E',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalClose: {
    backgroundColor: '#4A7C59',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

});

export default OptionalPayments;
