import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';

const ResetPasswordScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);

  const getPasswordStrength = (pass) => {
    if (!pass || pass.length < 6) return 'Weak';
    if (pass.length >= 8 && /[A-Za-z]/.test(pass) && /\d/.test(pass) && /[@$!%*#?&]/.test(pass)) return 'Strong';
    if (/[A-Za-z]/.test(pass) && /\d/.test(pass)) return 'Medium';
    return 'Weak';
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const isPasswordValid = () =>
    newPassword.length >= 6 &&
    /[A-Za-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[@$!%*#?&]/.test(newPassword) &&
    newPassword === confirmPassword;

  const handleRequestReset = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const formatted = `+1${cleaned}`;

    try {
      const response = await fetch('http://127.0.0.1:5000/request-password-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Check your phone for the code.');
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Could not send SMS.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request password reset. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!isPasswordValid()) {
      Alert.alert('Error', 'Password must meet complexity requirements and match confirmation.');
      return;
    }

    const cleaned = phoneNumber.replace(/\D/g, '');
    const formatted = `+1${cleaned}`;

    try {
      const response = await fetch('http://127.0.0.1:5000/reset-password-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatted,
          code: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Your password has been reset. Please log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Reset failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>

      {step === 1 ? (
        <>
          <Text style={styles.title}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestReset}>
            <Text style={styles.buttonText}>Request SMS Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="SMS Code"
            value={resetToken}
            onChangeText={setResetToken}
            textContentType="oneTimeCode" // This disables password suggestions
            autoComplete="sms-otp"
            keyboardType="number-pad"
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            textContentType="newPassword" // Suggests strong password if appropriate
            autoComplete="password-new"
            placeholderTextColor="#888"
          />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          placeholderTextColor="#888"
        />

          <Text style={{ marginTop: 5, color: '#888' }}>
            Password Strength: {passwordStrength}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f7e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#00796b',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    color: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00796b',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#e0f7e0',
  },
  
  
});

export default ResetPasswordScreen;
