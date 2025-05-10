import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  StyleSheet, Platform, StatusBar, Alert, Modal, TextInput, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000'; // Change to your backend

const AccountControlsScreen = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFirstName('');
    setLastName('');
    setOldPassword('');
    setNewPassword('');
    setReferralCode('');
    setNotificationsEnabled(false);
  };

  const submitChange = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    let url = '';
    let body = {};

    try {
      if (modalType === 'editProfile') {
        url = `${API_URL}/profile/update`;
        body = { first_name: firstName, last_name: lastName };
      } else if (modalType === 'changePassword') {
        url = `${API_URL}/profile/password`;
        body = { old_password: oldPassword, new_password: newPassword };
      } else if (modalType === 'referralCode') {
        url = `${API_URL}//validate-referral`;
        body = { referral_code: referralCode };
      } else if (modalType === 'notificationSettings') {
        url = `${API_URL}/profile/notifications`;
        body = { notifications_enabled: notificationsEnabled };
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      setLoading(false);
      if (response.ok) {
        Alert.alert('Success', result.message);
        closeModal();
      } else {
        Alert.alert('Error', result.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Error', 'Request failed.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Are you sure?",
      "Deleting your account is permanent. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
  
              if (!token || token.split('.').length !== 3) {
                Alert.alert('Error', 'You are not logged in. Please log in again.');
                setLoading(false);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                return;
              }
  
              const response = await fetch(`${API_URL}/profile/delete`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
  
              const resText = await response.text();
              console.log('🔍 Delete response:', response.status, resText);
  
              if (!response.ok) {
                if (response.status === 403) {
                  Alert.alert(
                    'Active Swaps Detected',
                    'You must complete or cancel all active swaps before deleting your account.'
                  );
                } else {
                  Alert.alert('Error', resText || 'Failed to delete account.');
                }
                setLoading(false);
                return;
              }
              
              Alert.alert('Deleted', 'Your account has been deleted.');
              await AsyncStorage.removeItem('token');
              setLoading(false);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  
            } catch (error) {
              setLoading(false);
              console.error('❌ Delete Error:', error);
              Alert.alert('Error', 'Something went wrong.');
            }
          }
        }
      ]
    );
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Account Controls</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => openModal('editProfile')}>
            <Text style={styles.optionText}>Edit Profile Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => openModal('changePassword')}>
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => openModal('referralCode')}>
            <Text style={styles.optionText}>Enter Referral Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => openModal('notificationSettings')}>
            <Text style={styles.optionText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={[styles.optionText, { color: 'white' }]}>
              {loading ? 'Processing...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for all settings */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'editProfile' && (
              <>
                <Text style={styles.modalTitle}>Edit Profile Info</Text>
                <TextInput
                  placeholder="First Name"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  placeholder="Last Name"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </>
            )}
            {modalType === 'changePassword' && (
              <>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TextInput
                  placeholder="Old Password"
                  style={styles.input}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <TextInput
                  placeholder="New Password"
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </>
            )}
            {modalType === 'referralCode' && (
              <>
                <Text style={styles.modalTitle}>Enter Referral Code</Text>
                <TextInput
                  placeholder="Referral Code"
                  style={styles.input}
                  value={referralCode}
                  onChangeText={setReferralCode}
                />
              </>
            )}
            {modalType === 'notificationSettings' && (
              <>
                <Text style={styles.modalTitle}>Notification Settings</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ marginRight: 10 }}>Enable Notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                </View>
              </>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitChange} style={styles.saveButton} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    color: '#4A7C59',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButton: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#DFF5E1',
  },
  optionText: {
    fontSize: 16,
    color: '#2F5D4A',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    borderBottomWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2F5D4A',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F8EC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#4A7C59',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#DFF5E1',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#2F5D4A',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AccountControlsScreen;
