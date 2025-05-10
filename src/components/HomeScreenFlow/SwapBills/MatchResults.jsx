import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const MatchResults = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { swap } = route.params || {};

  const handleContinue = () => {
    navigation.navigate('Active', { swap }); // Navigate to the new Pending page
  };  

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')} // Use clean visual for trust
        style={styles.image}
      />

      <Text style={styles.title}>You've Been Successfully Matched</Text>

      {swap?.matched_with ? (
        <Text style={styles.highlight}>
          Paired with: {swap.matched_with}
        </Text>
      ) : null}

      <Text style={styles.description}>
        Your bill has entered a verified swap. You're now linked with a trusted user who's helping your bill — and you're supporting theirs.
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>What’s Next?</Text>
        <Text style={styles.summaryText}>
          • Both users are being notified of the match.{'\n'}
          • Payment instructions will follow shortly.{'\n'}
          • You can track the swap on the next screen.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>View Match Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A7C59',
    textAlign: 'center',
    marginBottom: 10,
  },
  highlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E5F43',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  summaryLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MatchResults;
