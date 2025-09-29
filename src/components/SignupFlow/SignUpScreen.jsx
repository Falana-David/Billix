// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import logo from '../assets/logo.png';
import SignUpBasicInfo from './SignUpBasicInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOver18,  setIsOver18]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [state,     setState]     = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [gender,    setGender]    = useState('');
  const [birthdate, setBirthdate] = useState('');

  // ✅ NEW: ZIP state
  const [zip, setZip] = useState('');

  const handleNextStep = async () => {
    setLoading(true);
    try {
      // normalize zip to first 5 digits (adjust key to what your backend expects: zip, zip5, zip_code, etc.)
      const zip5 = zip.replace(/\D/g, '').slice(0, 5) || null;

      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          state,
          gender,
          birthdate,
          zip5,                 // ✅ include normalized ZIP
          referral_code: referralCode,
          profile_picture: profileImage, 
        }),
      });

      console.log('profileImage sending:', profileImage?.substring(0, 100));
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('hasSeenReadAlong', 'false');
        await AsyncStorage.setItem('token', data.token);
        navigation.replace('Home');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
          state={state}
          gender={gender}
          birthdate={birthdate}
          referralCode={referralCode}
          profileImage={profileImage}

          // setters
          setFirstName={setFirstName}
          setLastName={setLastName}
          setEmail={setEmail}
          setPhone={setPhone}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
          setIsOver18={setIsOver18}
          setState={setState}
          setGender={setGender}
          setBirthdate={setBirthdate}
          setReferralCode={setReferralCode}
          setProfileImage={setProfileImage}

          // ✅ pass ZIP props so child won't be undefined
          zip={zip}
          setZip={setZip}

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
  logo: { width: 120, height: 120 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SignUpScreen;
