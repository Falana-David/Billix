import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';

const RedeemingPointsScreen = ({ points, redeemPoints }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const rewards = [
    { id: '1', title: 'Gift Card for Utility Bills', cost: 500 },
    { id: '2', title: 'Discount Coupon for Groceries', cost: 300 },
    { id: '3', title: 'Gift Card for Gas Stations', cost: 400 },
    { id: '4', title: 'Gift Card for Online Shopping', cost: 500 },
    { id: '5', title: 'Subscription Services', cost: 600 },
    // Add more rewards as needed
  ];

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Redeeming Points</Text>
        {rewards.map(reward => (
          <View key={reward.id} style={styles.reward}>
            <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.rewardIcon} />
            <View style={styles.rewardDetails}>
              <Text style={styles.text}>{reward.title}</Text>
              <Text style={styles.description}>{reward.cost} points</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => redeemPoints(reward)}>
              <Text style={styles.buttonText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal for reward details */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reward Details</Text>
            {selectedReward && (
              <>
                <Text style={styles.text}>{selectedReward.title}</Text>
                <Text style={styles.text}>{selectedReward.cost} points</Text>
                <TouchableOpacity style={styles.button} onPress={() => redeemPoints(selectedReward)}>
                  <Text style={styles.buttonText}>Redeem</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
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
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5fa052',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#7F7F7F',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  rewardDetails: {
    flex: 1,
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
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default RedeemingPointsScreen;
