import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Header from './Header';
import EarningPointsScreen from './EarningPointsScreen';
import RedeemingPointsScreen from './RedeemingPointsScreen';

const RewardsScreen = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [points, setPoints] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Earning Points');

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch profile picture from AsyncStorage
      const profilePic = await AsyncStorage.getItem('profilePicture');
      setProfilePicture(profilePic);

      // Fetch points from Firestore
      const userId = 'example_user_id'; // Replace with actual user ID
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        setPoints(userDoc.data().points);
      }
    };

    fetchUserData();
  }, []);

  const renderContent = () => {
    if (selectedTab === 'Earning Points') {
      return <EarningPointsScreen />;
    } else {
      return <RedeemingPointsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.profileContainer}>
        <Image
          source={profilePicture ? { uri: profilePicture } : require('../assests/upload.png')}
          style={styles.profilePicture}
        />
        <Text style={styles.pointsText}>Points: {points}</Text>
      </View>

      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Rewards</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Earning Points' && styles.activeTab]}
          onPress={() => setSelectedTab('Earning Points')}
        >
          <Text style={styles.tabText}>Earning Points</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Redeeming Points' && styles.activeTab]}
          onPress={() => setSelectedTab('Redeeming Points')}
        >
          <Text style={styles.tabText}>Redeeming Points</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navbar: {
    backgroundColor: '#5fa052',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5fa052',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RewardsScreen;
