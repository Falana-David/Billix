import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // for token
import { Dropdown } from 'react-native-element-dropdown';
import { UserContext } from '../../UserContext';

const urgencyOptions = [
  { label: 'ASAP', value: 'ASAP' },
  { label: 'This week', value: 'This week' },
  { label: 'This month', value: 'This month' },
];

const rewardOptions = [
  { label: '$1 - $5', value: '1-5' },
  { label: '$5 - $10', value: '5-10' },
  { label: '$10+', value: '10+' },
];

const timeOptions = [
  { label: '15 min', value: '15 min' },
  { label: '30 min', value: '30 min' },
  { label: '1 hour', value: '1 hour' },
  { label: 'More than 1 hour', value: 'More than 1 hour' },
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
].map(state => ({ label: state, value: state }));

const FundingScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urgency: '',
    reward: '',
    location: '',
    time_required: '',
    extraNotes: '',
  });

  const [requests, setRequests] = useState([]);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.reward) {
      alert('Please fill out the required fields.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:5000/submit-help-exchange',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert('Your request has been submitted!');
      setFormData({
        title: '',
        description: '',
        urgency: '',
        reward: '',
        location: '',
        time_required: '',
        extraNotes: '',
      });
  
      // Optional: fetch updated list from backend
      fetchRequests();
  
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/get-help-exchange', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to load requests', error);
    }
  };
  
  // Call once on load
  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Help Exchange</Text>

        <View style={styles.tabRow}>
  <TouchableOpacity
    style={[
      styles.tabButton,
      activeTab === 'form' ? styles.activeTab : styles.inactiveTab,
    ]}
    onPress={() => setActiveTab('form')}
  >
    <Text style={[styles.tabText, { color: activeTab === 'form' ? '#fff' : '#4A7C59' }]}>
      Ask for Help
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.tabButton,
      activeTab === 'requests' ? styles.activeTab : styles.inactiveTab,
    ]}
    onPress={() => setActiveTab('requests')}
  >
    <Text style={[styles.tabText, { color: activeTab === 'requests' ? '#fff' : '#4A7C59' }]}>
      View Requests
    </Text>
  </TouchableOpacity>
</View>


        {activeTab === 'form' ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionHeader}>What do you need help with?</Text>
            <TextInput
              style={styles.input}
              placeholder="Short Title"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Describe your request"
              multiline
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />
            <Dropdown
  data={urgencyOptions}
  labelField="label"
  valueField="value"
  placeholder="Urgency"
  value={formData.urgency}
  onChange={(item) => handleInputChange('urgency', item.value)}
  style={styles.input}
/>

<Dropdown
  data={rewardOptions}
  labelField="label"
  valueField="value"
  placeholder="Offered Reward"
  value={formData.reward}
  onChange={(item) => handleInputChange('reward', item.value)}
  style={styles.input}
/>

<Dropdown
  data={states}
  labelField="label"
  valueField="value"
  placeholder="Location"
  value={formData.location}
  onChange={(item) => handleInputChange('location', item.value)}
  style={styles.input}
/>

<Dropdown
  data={timeOptions}
  labelField="label"
  valueField="value"
  placeholder="Time Required"
  value={formData.time_required}
  onChange={(item) => handleInputChange('time_required', item.value)}
  style={styles.input}
/>

            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Extra Notes (optional)"
              multiline
              value={formData.extraNotes}
              onChangeText={(text) => handleInputChange('extraNotes', text)}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.requestList}>
            <Text style={styles.sectionHeader}>Live Requests</Text>
            {requests.length === 0 ? (
              <Text style={styles.emptyText}>No requests yet.</Text>
            ) : (
              requests.map((req, index) => (
                <View key={index} style={styles.card}>
  {/* Profile Row */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    {req.profile_picture ? (
      <Image
        source={{ uri: req.profile_picture }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
    ) : null}
    <View>
      <Text style={{ fontWeight: '600', color: '#2F5D4A' }}>{req.user}</Text>
      <Text style={{ fontSize: 12, color: '#888' }}>{req.created_at}</Text>
    </View>
  </View>

  {/* Content */}
  <Text style={styles.cardTitle}>{req.title}</Text>
  <Text style={styles.cardDetail}>{req.description}</Text>
  <Text style={styles.cardSub}>
    Time: {req.time_required || 'N/A'} | Urgency: {req.urgency || 'Not set'}
  </Text>
  <Text style={styles.cardSub}>Location: {req.location || 'Anywhere'}</Text>
  <Text style={styles.cardReward}>Reward: {req.reward}</Text>

  {/* Claim Button */}
  {user.id !== req.user_id && (
  <TouchableOpacity
  style={[styles.submitButton, { marginTop: 10 }]}
  onPress={async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://127.0.0.1:5000/claim-help-exchange/${req.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Remove this request from the list
      setRequests(prev => prev.filter((_, i) => i !== index));

      // ✅ Navigate to chat screen
      navigation.navigate('ChatScreen', { partnerId: req.user_id });
    } catch (error) {
      console.error('Failed to claim request:', error);
      alert('Failed to claim this request. It may have already been taken.');
    }
  }}
>
  <Text style={styles.submitButtonText}>Claim</Text>
</TouchableOpacity>

)}
</View>

              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#4A7C59',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 14,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    borderColor: '#C6E2D1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: '#2F5D4A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  requestList: {
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A7C59',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 14,
    color: '#3B3B3B',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#666',
  },
  cardReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
    marginTop: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A7C59',
  },
  
  activeTab: {
    backgroundColor: '#4A7C59',
  },
  
  inactiveTab: {
    backgroundColor: '#F0F8EC',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  
});

export default FundingScreen;
