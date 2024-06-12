import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const placeholderImages = [
  'https://via.placeholder.com/150/FF0000/FFFFFF?text=Goal+1',
  'https://via.placeholder.com/150/00FF00/FFFFFF?text=Goal+2',
  'https://via.placeholder.com/150/0000FF/FFFFFF?text=Goal+3',
  'https://via.placeholder.com/150/FFFF00/FFFFFF?text=Goal+4',
  'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Goal+5'
];

const SetGoalModal = ({ visible, setVisible, setGoal, goal, openPostConfirmation }) => {
  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setGoal({ ...goal, image: source });
      }
    });
  };

  const handleAddGoal = () => {
    setVisible(false);
    openPostConfirmation();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set a New Goal</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={goal.title}
            onChangeText={(text) => setGoal({ ...goal, title: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={goal.description}
            onChangeText={(text) => setGoal({ ...goal, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Required Amount"
            value={goal.amount}
            onChangeText={(text) => setGoal({ ...goal, amount: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.uploadButton} onPress={handleSelectImage}>
            <Text style={styles.buttonText}>Upload an Image (Optional)</Text>
          </TouchableOpacity>
          <Image
            style={styles.goalImage}
            source={goal.image ? goal.image : { uri: placeholderImages[Math.floor(Math.random() * placeholderImages.length)] }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAddGoal}>
              <Text style={styles.buttonText}>Add Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={setVisible}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  goalImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default SetGoalModal;
