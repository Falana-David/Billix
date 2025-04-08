import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';

const PostConfirmationModal = ({ visible, setVisible, goal }) => {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handlePostToPublicBoard = () => {
    // Logic to post the goal to the public board
    console.log('Posted to public board:', goal);
    setVisible(false);
    Alert.alert('Success', 'Your goal has been posted to the public board.');
  };

  const handleYes = () => {
    setConfirmVisible(true);
  };

  const handleNo = () => {
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Post to Public Board</Text>
          <Text style={styles.text}>Posting this goal to the public board will allow anyone to see your goal and donate towards it. You will be rewarded with bonuses for donations received. A fee of $2 will be charged for this service.</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleYes}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleNo}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {confirmVisible && (
        <View style={styles.confirmContainer}>
          <View style={styles.confirmContent}>
            <Text style={styles.confirmTitle}>Confirm Payment</Text>
            <Text style={styles.confirmText}>A $2 fee will be charged to your card for posting this goal to the public board.</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handlePostToPublicBoard}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
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
  text: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  confirmContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default PostConfirmationModal;
