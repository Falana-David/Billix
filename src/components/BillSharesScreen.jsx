import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';


const storeItems = [
  {
    id: 1,
    title: 'Unlock Swap Access',
    price: 1.0,
    description: 'Required to post a bill unless subscribed',
  },
  {
    id: 2,
    title: 'Monthly Subscription',
    price: 5.0,
    description: 'Skip $1 fees, get bill boosts, priority matching',
    bestSeller: true,
  },
  {
    id: 3,
    title: 'Protected Swap',
    price: 1.0,
    description: 'Adds moderation & dispute support to a swap',
  },
  {
    id: 4,
    title: 'Bill Boost',
    price: 1.99,
    description: 'Pushes your bill to the top of the public feed',
  },
  {
    id: 5,
    title: 'Urgent Badge',
    price: 0.5,
    description: 'Adds urgency flag to your listing',
  },
  {
    id: 6,
    title: 'Story Spotlight',
    price: 0.99,
    description: 'Lets you write a personal note about your situation',
  },
  {
    id: 7,
    title: 'Swap Recovery Credit',
    price: 0.99,
    description: 'Requeues an unsuccessful swap attempt',
  },
  {
    id: 8,
    title: 'Verified Badge',
    price: 1.99,
    description: 'Shows you’ve passed identity verification',
  },
];

const BillSharesScreen = ({ navigation }) => {
  const [cart, setCart] = useState([]);

  const toggleItem = (item) => {
    if (cart.find((c) => c.id === item.id)) {
      setCart(cart.filter((c) => c.id !== item.id));
    } else {
      setCart([...cart, item]);
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    const token = await AsyncStorage.getItem('token');
    const totalAmount = parseFloat(getTotal());
  
    if (!token) {
      Alert.alert('Auth Error', 'You must be logged in to continue.');
      return;
    }
  
    if (cart.length === 0 || totalAmount <= 0) {
      Alert.alert('No Items', 'Add at least one item to checkout.');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:5000/payment-sheet-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          items: cart.map(item => item.id),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Payment Error', errorData?.error || 'Failed to initialize checkout');
        return;
      }
  
      const { paymentIntent, ephemeralKey, customer } = await response.json();
  
      const { error: initError } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Billix Store',
        returnURL: 'billix://home',
      });
  
      if (initError) {
        Alert.alert('Stripe Init Error', initError.message);
        return;
      }
  
      const { error: presentError } = await presentPaymentSheet();
  
      if (presentError) {
        Alert.alert('Payment Cancelled', 'You can continue shopping.');
        return;
      }
  
      Alert.alert('Success', 'Your purchase was successful!');
      setCart([]); // Clear cart on success
    } catch (error) {
      Alert.alert('Unexpected Error', error.message || 'Something went wrong');
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Billix Store</Text>

        {storeItems.map((item) => {
          const inCart = cart.find((c) => c.id === item.id);
          return (
            <View key={item.id} style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
                </View>
                {item.bestSeller && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Best Seller</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardDescription}>{item.description}</Text>

              <TouchableOpacity
                style={[
                  styles.cartButton,
                  { backgroundColor: inCart ? '#888' : '#4A7C59' },
                ]}
                onPress={() => toggleItem(item)}
              >
                <Text style={styles.cartButtonText}>
                  {inCart ? 'Remove' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartText}>
            {cart.length} item{cart.length > 1 ? 's' : ''} | Total: ${getTotal()}
          </Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BillSharesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  backText: {
    fontSize: 16,
    color: '#4A7C59',
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
    color: '#2F5D4A',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00A86B',
  },
  badge: {
    backgroundColor: '#DEF7E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#2F5D4A',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 15,
    color: '#444',
    marginBottom: 14,
    lineHeight: 22,
  },
  cartButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4A7C59',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  cartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  checkoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
