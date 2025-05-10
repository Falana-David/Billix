import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Alert, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import { Buffer } from 'buffer';
import logo from '../../assets/logo.png'; // Update the path as necessary


const screenWidth = Dimensions.get("window").width;

const convertImageToBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
};


const ProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // const [modalVisible, setModalVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [trustScore, setTrustScore] = useState(4.2);
  const [accountStatus, setAccountStatus] = useState('Active');
  const [profileVersion, setProfileVersion] = useState(0);
  const [activitySummary, setActivitySummary] = useState({
    bills_helped: 0,
    bills_posted: 0,
    total_value_helped: 0,
    trust_streak: 0
  });
  

  const [impactData, setImpactData] = useState({ total_uploaded: 0, total_helped: 0 });
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    await fetchImpactData();
    await fetchActivitySummary();
    setRefreshing(false);
  };
  
  const fetchImpactData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || token.split('.').length < 3) {
        console.error("❌ Invalid or missing token");
        return;
      }
      const response = await fetch('http://127.0.0.1:5000/billix-impact', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const text = await response.text();
      console.log('Raw response:', text);
      if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
      const data = JSON.parse(text);
      setImpactData(data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
    }
  };
  
  const fetchActivitySummary = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/billix-activity-summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const text = await res.text();
      const data = JSON.parse(text);
      setActivitySummary(data);
    } catch (err) {
      console.error('Failed to fetch activity summary:', err);
    }
  };
  
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
        setPhone(data.phone_number || '');
        setState(data.state || '');
        setGender(data.gender || '');
        setDob(data.dob || '');
        setPoints(data.points || 0);
        setTrustScore(data.trust_score || 4.2);
        setProfilePicture(
          data.profile_picture?.startsWith('data:')
            ? data.profile_picture
            : `data:image/jpeg;base64,${data.profile_picture}`
        );
      } else {
        console.error('Failed to fetch profile data:', text);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };


  const impactPercentage = impactData.total_uploaded
    ? (impactData.total_helped / impactData.total_uploaded)
    : 0;

    useEffect(() => {
      fetchImpactData();
    }, []);
    
    useEffect(() => {
      fetchActivitySummary();
    }, []);
    
    useEffect(() => {
      fetchProfileData();
    }, []);

  const uploadProfilePicture = async (base64) => {
    console.log('📡 Starting uploadProfilePicture');
  
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔐 Token:', token ? '[exists]' : '❌ MISSING');
  
      const cleanedBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      console.log('📦 Payload size:', cleanedBase64.length);
      console.log('🌐 Ready to fetch with body length:', JSON.stringify({ profile_picture: cleanedBase64 }).length);

      const res = await fetch('http://127.0.0.1:5000/update-profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_picture: cleanedBase64 }),
      });
  
      const resText = await res.text();
      console.log('📬 Response status:', res.status, resText);
      return res.ok;
    } catch (err) {
      console.error('🔥 Upload ERROR:', err.message);
      return false;
    }
  };


  const choosePhotoFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true, // 🔥 this is the key
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
      },
      async (response) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]?.base64) {
          const base64Image = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
          setProfilePicture(base64Image);
          const success = await uploadProfilePicture(base64Image);
          if (success) {
            await fetchProfileData();
          }
        } else {
          console.warn('Image picker cancelled or failed');
        }
      }
    );    
  };
  

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert("Logout", "You have been logged out.", [
      { text: "OK", onPress: () => navigation.replace('Login') }
    ]);
  };

  const imageSource =
  profilePicture && profilePicture.startsWith('data:image/')
    ? { uri: profilePicture } // don't append `?v=` to base64
    : logo;


  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4a9040"
          />
        }
      >

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

          <TouchableOpacity onPress={choosePhotoFromLibrary}>
  <Image style={styles.avatar} source={imageSource} />
  {uploading && <Text style={styles.uploadingText}>Uploading...</Text>}
</TouchableOpacity>


        </View>

        <View style={styles.quickActionsRow}>
  <TouchableOpacity
    style={styles.quickButtonPrimary}
    onPress={() => navigation.navigate('HelpScreen')}
  >
    <Text style={styles.quickText}>Help</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.quickButtonSecondary}
    onPress={() => navigation.navigate('AccountControlsScreen')}
  >
    <Text style={styles.quickText}>Account Controls</Text>
  </TouchableOpacity>
</View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Overview</Text>
          <Text style={styles.itemText}>Name: {firstName || 'John'} {lastName || 'Doe'}</Text>
          <Text style={styles.itemText}>Email: {email || 'you@email.com'}</Text>
          <Text style={styles.itemText}>Points: {points}</Text>
          <Text style={styles.itemText}>Account Status: {accountStatus}</Text>
        </View>

        <View style={styles.section}>
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Progress.Circle
            progress={impactPercentage}
            size={150}
            thickness={10}
            color="#4a9040"
            unfilledColor="#d6eadf"
            borderWidth={0}
            showsText={true}
            formatText={() => `${Math.round(impactPercentage * 100)}%`}
            textStyle={{ fontWeight: 'bold', fontSize: 18 }}
          />
          <Text style={{ marginTop: 10, fontWeight: '600', fontSize: 15, color: '#333' }}>
            Bills You've Helped Cover
          </Text>
        </View>
        </View>

        <View style={styles.section}>
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Billix Activity Summary</Text>

  <View style={styles.statsRow}>
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>Bills Helped</Text>
      <Text style={styles.statValue}>{activitySummary.bills_helped}</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>Bills Posted</Text>
      <Text style={styles.statValue}>{activitySummary.bills_posted}</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>Total Value Helped</Text>
      <Text style={styles.statValue}>${(activitySummary.total_value_helped ?? 0).toFixed(2)}</Text>

    </View>
  </View>
  <View style={styles.trustRow}>
    <Text style={styles.trustLabel}>Trust Streak</Text>
    <Text style={styles.trustValue}>
      {activitySummary.trust_streak} successful swaps in a row
    </Text>
  </View>
</View>
    </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {['Privacy', 'Support', 'Legal'].map((item, i) => (
            <TouchableOpacity key={i} style={styles.linkItem}>
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

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
  statsRow: {
    gap: 12,
    marginTop: 10,
  },
  
  statCard: {
    backgroundColor: '#f3fcf5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'column',
    borderLeftWidth: 5,
    borderLeftColor: '#4a9040',
  },
  
  statTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#31733e',
    marginBottom: 6,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  
  trustRow: {
    marginTop: 18,
  },
  
  trustLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#31733e',
    marginBottom: 6,
  },
  
  trustValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  uploadingText: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#4a9040',
  }
  
  
});

export default ProfileScreen;
