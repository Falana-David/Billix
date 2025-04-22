import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Image, Dimensions, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

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
  const [trustScore, setTrustScore] = useState(4.2);

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

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        data: [250, 180, 200, 130],
        strokeWidth: 2,
        color: () => '#4a9040',
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.userName}>{firstName || 'John'} {lastName || 'Doe'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: '#b9e7c9' }]}>
                <Text style={[styles.badgeText, { color: '#287d42' }]}>★ {trustScore.toFixed(2)} / 5</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#e0f5e7' }]}>
                <Text style={[styles.badgeText, { color: '#3d8b3d' }]}>Verified</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image style={styles.avatar} source={profilePicture} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickButtonPrimary}><Text style={styles.quickText}>Help</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickButtonSecondary}><Text style={styles.quickText}>Wallet</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickButtonOutline}><Text style={styles.quickText}>Activity</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickButtonOutline}><Text style={styles.quickText}>Settings</Text></TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Overview</Text>
          <Text style={styles.itemText}>Name: {firstName || 'John'} {lastName || 'Doe'}</Text>
          <Text style={styles.itemText}>Email: {email || 'you@email.com'}</Text>
          <Text style={styles.itemText}>Points: {points}</Text>
          <Text style={styles.itemText}>Account Status: {accountStatus}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Billix Impact</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={200}
            bezier
            withShadow={false}
            chartConfig={{
              backgroundGradientFrom: '#f3f0ff',
              backgroundGradientTo: '#f3f0ff',
              decimalPlaces: 0,
              color: () => '#4a9040',
              labelColor: () => '#555',
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#4a9040' },
              propsForBackgroundLines: { stroke: '#ddd' }
            }}
            style={{ borderRadius: 16, marginTop: 10 }}
          />
          <TouchableOpacity style={styles.spendingButton}>
            <Text style={styles.spendingText}>See Spending Summary</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {['Privacy', 'Notifications', 'Support', 'Invite Friends', 'Legal'].map((item, i) => (
            <TouchableOpacity key={i} style={styles.linkItem}>
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
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
            <TouchableOpacity style={styles.uploadButton} onPress={choosePhotoFromLibrary}>
              <Text style={styles.uploadText}>Upload New Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.uploadText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f5e9' },
  scrollContainer: { paddingBottom: 160 },
  headerSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 70, paddingBottom: 10,
  },
  userName: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  badgeRow: { flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' },
  badge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  badgeText: { fontWeight: '600', fontSize: 13 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: '#d0e7d8', backgroundColor: '#ccc'
  },
  quickActionsRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly',
    marginHorizontal: 20, marginTop: 12, marginBottom: 20
  },
  quickButtonPrimary: {
    backgroundColor: '#6db96d', paddingVertical: 10, borderRadius: 10, width: '45%', alignItems: 'center',
  },
  quickButtonSecondary: {
    backgroundColor: '#4a9040', paddingVertical: 10, borderRadius: 10, width: '45%', alignItems: 'center',
  },
  quickButtonOutline: {
    borderColor: '#4a9040', borderWidth: 1.5, paddingVertical: 10, borderRadius: 10, width: '45%', alignItems: 'center',
  },
  quickText: { fontWeight: '600', fontSize: 14, color: '#1a1a1a' },
  section: {
    backgroundColor: '#ffffff', marginHorizontal: 20, marginVertical: 10,
    borderRadius: 16, padding: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8, color: '#222' },
  itemText: { fontSize: 14, marginBottom: 6, color: '#333' },
  linkItem: { paddingVertical: 10, borderBottomColor: '#eee', borderBottomWidth: 1 },
  spendingButton: {
    marginTop: 12, alignSelf: 'center', backgroundColor: '#f0fff0',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  spendingText: { color: '#4a9040', fontWeight: '600', fontSize: 15 },
  logoutButton: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: '#d9534f', paddingVertical: 15, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%', backgroundColor: '#fff', padding: 20,
    borderRadius: 15, alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalImage: { width: 80, height: 80, borderRadius: 40, marginHorizontal: 8, marginBottom: 10 },
  uploadButton: {
    marginTop: 10, backgroundColor: '#4a9040', paddingVertical: 10,
    paddingHorizontal: 20, borderRadius: 8,
  },
  uploadText: { color: '#fff', fontWeight: '600' },
});

export default ProfileScreen;
