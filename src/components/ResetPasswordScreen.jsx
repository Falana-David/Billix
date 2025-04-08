import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(''); // Changed to resetToken
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request reset, 2: Enter new password

  const handleRequestReset = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Check your email for the reset link or token.');
        setStep(2);
      } else {
        const { message } = await response.json();
        Alert.alert('Error', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request password reset. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: resetToken, new_password: newPassword }), // Ensure keys match backend expectations
      });

      if (response.ok) {
        Alert.alert('Success', 'Your password has been reset. Please log in.');
        navigation.navigate('Login');
      } else {
        const { message } = await response.json();
        Alert.alert('Error', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestReset}>
            <Text style={styles.buttonText}>Request Reset</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Reset token"
            value={resetToken}
            onChangeText={setResetToken}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f7e0', // Light green background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b', // Dark teal color
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#00796b', // Dark teal border color
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff', // White background
    color: '#333',
    elevation: 3, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00796b', // Dark teal background color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
