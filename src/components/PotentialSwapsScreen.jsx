import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserContext } from './UserContext';

const PotentialSwapsScreen = ({ route, navigation }) => {
  const { user } = useContext(UserContext); // Get user context for JWT token
  const { pendingSwaps, setActiveSwaps, setPendingSwaps } = route.params;

  const handleAcceptSwap = (swapId) => {
    // Make API call to accept the swap
    fetch(`http://127.0.0.1:5000/accept-swap/${swapId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`, // Use the token from user context
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Swap accepted') {
          // Move the accepted swap to active swaps
          const acceptedSwap = pendingSwaps.find((swap) => swap.id === swapId);
          setActiveSwaps((prevActiveSwaps) => [...prevActiveSwaps, acceptedSwap]);
          // Remove the swap from pending swaps
          setPendingSwaps((prevPendingSwaps) => prevPendingSwaps.filter((swap) => swap.id !== swapId));
          Alert.alert('Success', 'Swap accepted successfully.');
          navigation.goBack(); // Navigate back to the previous screen
        } else {
          console.error('Error accepting swap:', data.message);
          Alert.alert('Error', data.message || 'Failed to accept swap');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while accepting the swap');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Swaps</Text>
      {pendingSwaps.length > 0 ? (
        pendingSwaps.map((swap) => (
          <View key={swap.id} style={styles.swapCard}>
            <Text style={styles.swapText}>{swap.billType}</Text>
            <Text style={styles.swapSubText}>Amount: ${swap.amount}</Text>
            <Text style={styles.swapSubText}>{swap.terms}</Text>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => handleAcceptSwap(swap.id)}>
              <Text style={styles.buttonText}>Accept Swap</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noSwapsText}>No swaps available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8EC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    textAlign: 'center',
    marginVertical: 20,
  },
  swapCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  swapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  swapSubText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 3,
  },
  noSwapsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#4A7C59',
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PotentialSwapsScreen;
