import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

import Header from '../components/Header';

const screenWidth = Dimensions.get('window').width;

const profileImages = [
  require('./assets/pig.png'),
  require('./assets/sheep.png'),
  require('./assets/tiger.png'),
  require('./assets/elephant.png'),
  require('./assets/whale.png'),
  require('./assets/lion.png'),
  require('./assets/deer.png'),
  require('./assets/bird.png'),
];

const ProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [accountStatus, setAccountStatus] = useState('Active');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });

        const text = await response.text();

        if (response.ok) {
          const data = JSON.parse(text);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setEmail(data.email);
          setPoints(data.points);
          setProfilePicture(data.profile_picture ? { uri: data.profile_picture } : profileImages[0]);
        } else {
          console.error('Failed to fetch profile data:', text);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const choosePhotoFromLibrary = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (!response.didCancel && !response.errorCode) {
        const uri = response.assets[0].uri;
        setProfilePicture({ uri });
        await AsyncStorage.setItem('profilePicture', uri);

        const token = await AsyncStorage.getItem('token');
        await fetch('http://127.0.0.1:5000/update-profile-picture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
          body: JSON.stringify({ profile_picture: uri }),
        });

        setModalVisible(false);  
      }
    });
  };

  const handleProfileImageSelection = async (image) => {
    setProfilePicture(image);
    await AsyncStorage.setItem('profilePicture', image.uri);

    const token = await AsyncStorage.getItem('token');
    await fetch('http://127.0.0.1:5000/update-profile-picture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify({ profile_picture: image.uri }),
    });

    setModalVisible(false); 
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert("Logout", "You have been logged out.", [
      { text: "OK", onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            style={styles.profilePicture}
            source={profilePicture}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Account Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Security</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.text}>Name: {firstName} {lastName}</Text>
          <Text style={styles.text}>Email: {email}</Text>
          <Text style={styles.text}>Points: {points}</Text>
          <Text style={styles.text}>Account Status: {accountStatus}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Profile Picture</Text>
            <ScrollView horizontal>
              {profileImages.map((image, index) => (
                <TouchableOpacity key={index} onPress={() => handleProfileImageSelection(image)}>
                  <Image source={image} style={styles.modalImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={choosePhotoFromLibrary}>
              <Text style={styles.buttonText}>Upload New Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f5e1',
  },
  profilePictureContainer: {
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 20,
  },
  profilePicture: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center', 
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%', 
  },
  card: {
    width: (screenWidth / 3) - 25,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    backgroundColor: '#4a9040',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 5, 
  },
  cardText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
    width: '90%', 
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5fa052',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    marginBottom: 30, 
    alignSelf: 'center',
    width: '90%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginHorizontal: 10,
    marginBottom: 20,
  },
});

export default ProfileScreen;
