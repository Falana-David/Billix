import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const CreateCampaignScreen = ({ navigation }) => {
  const [campaignImage, setCampaignImage] = useState(null);
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleImagePick = () => {
    launchImageLibrary({}, response => {
      if (response.assets) {
        setCampaignImage(response.assets[0].uri);
      }
    });
  };

  const handleCreateCampaign = () => {
    // Handle campaign creation
    // Validation and API call to create the campaign
    if (amount < 1 || amount > 2000) {
      alert("Please enter an amount between 1 and 2000.");
      return;
    }

    if (!campaignImage) {
      alert("Please upload an image for your campaign.");
      return;
    }

    // Proceed with the campaign creation process (e.g., API call)
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create a New Campaign</Text>

      <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>
          {campaignImage ? 'Change Image' : 'Upload Campaign Image'}
        </Text>
      </TouchableOpacity>

      {campaignImage && <Image source={{ uri: campaignImage }} style={styles.uploadedImage} />}

      <TextInput
        style={styles.input}
        placeholder="Enter amount (1 - 2000)"
        value={amount}
        onChangeText={(value) => setAmount(value)}
        keyboardType="numeric"
        maxLength={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter campaign deadline"
        value={deadline}
        onChangeText={(value) => setDeadline(value)}
      />
      
      <Text style={styles.notice}>
        Please do not upload your actual bill as the campaign image. This is to protect your sensitive information.
      </Text>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateCampaign}>
        <Text style={styles.createButtonText}>Submit Campaign</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b5998',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imagePicker: {
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#3b5998',
    fontSize: 16,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
  },
  notice: {
    color: '#ff4d4d',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#3b5998',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateCampaignScreen;
