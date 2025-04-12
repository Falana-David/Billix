// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import logo from '../assets/logo.png';
import SignUpBasicInfo from './SignUpBasicInfo';

const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    navigation.replace('AppTour');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796b" />
        ) : (
          <Image source={logo} style={styles.logo} />
        )}
      </View>
      <Text style={styles.title}>Create Your Billix Account</Text>

      {step === 1 && (
        <SignUpBasicInfo
          firstName={firstName}
          lastName={lastName}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          phone={phone}
          isOver18={isOver18}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setEmail={setEmail}
          setPhone={setPhone}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
          setIsOver18={setIsOver18}
          handleNextStep={handleNextStep}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f7e0',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 75,
    backgroundColor: '#ffffff',
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SignUpScreen;
