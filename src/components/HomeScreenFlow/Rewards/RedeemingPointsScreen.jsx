import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert } from 'react-native';

const RedeemingPointsScreen = ({ points, handleRedeemReward }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const rewards = [
    { id: '1', title: 'Gift Card for Utility Bills', cost: 500 },
    { id: '2', title: 'Discount Coupon for Groceries', cost: 300 },
    { id: '3', title: 'Gift Card for Gas Stations', cost: 400 },
    { id: '4', title: 'Gift Card for Online Shopping', cost: 500 },
    { id: '5', title: 'Subscription Services', cost: 600 },
  ];

  const redeemPoints = async (reward) => {
    if (points < reward.cost) {
      Alert.alert('Error', 'You do not have enough points to redeem this reward.');
      return;
    }

    handleRedeemReward(reward.id, reward.cost);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.sectionHeader}>Redeeming Points</Text>
        <Text style={styles.subText}>Use your points to redeem valuable rewards. Select a reward to view details and redeem it.</Text>
      </View>
      {rewards.map((reward) => (
        <View key={reward.id} style={styles.rewardCard}>
          <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.rewardIcon} />
          <View style={styles.rewardDetails}>
            <Text style={styles.text}>{reward.title}</Text>
            <Text style={styles.description}>{reward.cost} points</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.redeemButton]}
            onPress={() => {
              setSelectedReward(reward);
              setModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Redeem</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reward Details</Text>
            {selectedReward && (
              <>
                <Text style={styles.text}>{selectedReward.title}</Text>
                <Text style={styles.text}>{selectedReward.cost} points</Text>
                <TouchableOpacity style={[styles.button, styles.redeemButton]} onPress={() => redeemPoints(selectedReward)}>
                  <Text style={styles.buttonText}>Redeem</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: '#F08080', // Light red background
    paddingHorizontal: 10,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#C62828', // Dark red
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rewardIcon: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  rewardDetails: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#777',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redeemButton: {
    backgroundColor: '#C62828', // Dark red for redeem buttons
  },
  closeButton: {
    backgroundColor: '#d9534f', // Red for the close button
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#C62828', // Dark red title
  },
});

export default RedeemingPointsScreen;
