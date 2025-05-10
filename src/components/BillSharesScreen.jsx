import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const testShares = [
  { id: 1, name: 'Electric - NY', change: '+3.5%', value: '$42.30' },
  { id: 2, name: 'Rent - CA', change: '-1.2%', value: '$298.00' },
  { id: 3, name: 'Medical - TX', change: '+7.8%', value: '$89.10' },
  { id: 4, name: 'Phone - FL', change: '+0.5%', value: '$15.20' },
];

const BillSharesScreen = () => {
  const [isSubscribed, setIsSubscribed] = useState(false); // Replace with real Stripe check

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Billix Bill Shares</Text>

      {!isSubscribed ? (
        <View style={styles.lockedView}>
          <Text style={styles.lockedText}>Unlock full access to your Bill Shares dashboard.</Text>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeText}>Subscribe Now</Text>
          </TouchableOpacity>
          <Image source={require('./assets/logo.png')} style={styles.lockImage} />
        </View>
      ) : (
        <View style={styles.sharesContainer}>
          <Text style={styles.subHeader}>Your Portfolio</Text>
          {testShares.map((share) => (
            <View key={share.id} style={styles.card}>
              <Text style={styles.cardTitle}>{share.name}</Text>
              <Text style={styles.cardValue}>{share.value}</Text>
              <Text style={styles.cardChange}>{share.change}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default BillSharesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8f5',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e5d4e',
    textAlign: 'center',
    marginVertical: 20,
  },
  lockedView: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  lockedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  subscribeButton: {
    backgroundColor: '#2e5d4e',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  subscribeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  lockImage: {
    width: 70,
    height: 70,
    tintColor: '#ccc',
    marginTop: 10,
  },
  sharesContainer: {
    marginTop: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2e5d4e',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#bbb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  cardValue: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  cardChange: {
    fontSize: 14,
    marginTop: 6,
    color: '#29a36d',
    fontWeight: '500',
  },
});
