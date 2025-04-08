// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import PhoneInput from 'react-native-phone-input';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import logo from '../assets/logo.png'; // Update the path as necessary
import profileIcon from '../assets/person_icon.png'; // Placeholder icon

const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [gender, setGender] = useState(null);
  const [birthdate, setBirthdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const stateOptions = [
    { label: 'Alabama', value: 'Alabama' },
    { label: 'Alaska', value: 'Alaska' },
    { label: 'Arizona', value: 'Arizona' },
    { label: 'Arkansas', value: 'Arkansas' },
    { label: 'California', value: 'California' },
    { label: 'Colorado', value: 'Colorado' },
    { label: 'Connecticut', value: 'Connecticut' },
    { label: 'Delaware', value: 'Delaware' },
    { label: 'Florida', value: 'Florida' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Hawaii', value: 'Hawaii' },
    { label: 'Idaho', value: 'Idaho' },
    { label: 'Illinois', value: 'Illinois' },
    { label: 'Indiana', value: 'Indiana' },
    { label: 'Iowa', value: 'Iowa' },

    { label: 'Kansas', value: 'Kansas' },
    { label: 'Kentucky', value: 'Kentucky' },
    { label: 'Maine', value: 'Maine' },
    { label: 'Maryland', value: 'Maryland' },
    { label: 'Massachusetts', value: 'Massachusetts' },
    { label: 'Michigan', value: 'Michigan' },
    { label: 'Minnesota', value: 'Minnesota' },
    { label: 'Mississippi', value: 'Mississippi' },
    { label: 'Missouri', value: 'Missouri' },
    { label: 'Montana', value: 'Montana' },

    { label: 'Nebraska', value: 'Nebraska' },
    { label: 'Nevada', value: 'Nevada' },
    { label: 'New Hampshire', value: 'New Hampshire' },
    { label: 'New Jersey', value: 'New Jersey' },
    { label: 'New Mexico', value: 'New Mexico' },
    { label: 'New York', value: 'New York' },
    { label: 'North Carolina', value: 'North Carolina' },
    { label: 'North Dakota', value: 'North Dakota' },
    { label: 'Ohio', value: 'Ohio' },
    { label: 'Oklahoma', value: 'Oklahoma' },

    { label: 'Oregon', value: 'Oregon' },
    { label: 'Pennsylvania', value: 'Pennsylvania' },
    { label: 'Rhode Island', value: 'Rhode Island' },
    { label: 'South Carolina', value: 'South Carolina' },
    { label: 'South Dakota', value: 'South Dakota' },
    { label: 'Tennessee', value: 'Tennessee' },
    { label: 'Texas', value: 'Texas' },
    { label: 'Utah', value: 'Utah' },
    { label: 'Vermont', value: 'Vermont' },
    { label: 'Virginia', value: 'Virginia' },

    { label: 'Washington', value: 'Washington' },
    { label: 'West Virginia', value: 'West Virginia' },
    { label: 'Wisconsin', value: 'Wisconsin' },
    { label: 'Wyoming', value: 'Wyoming' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non_binary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSignUp = async () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert('Error', 'You must accept the terms of service and privacy policy to sign up.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    apartment,
    city,
    state,
    postalCode,
    gender,
    birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null,
    profile_picture: profilePicture,  // Changed from profilePicture to match backend
  })
  ,
  
});
console.log(JSON.stringify({
  firstName,
  lastName,
  email,
  phone,
  password,
  address,
  apartment,
  city,
  state,
  postalCode,
  gender,
  birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null,
  profilePicture,
}));


      if (response.ok) {
        const { token } = await response.json();
        await AsyncStorage.setItem('token', token);
        setLoading(false);
        navigation.navigate('Home'); // Redirect to home or dashboard screen
      } else {
        const { message } = await response.json();
        setLoading(false);
        Alert.alert('Error', message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePostalCode = (postalCode) => {
    const re = /^\d{5}(-\d{4})?$/;
    return re.test(String(postalCode));
  };

  const isPasswordValid = () => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return re.test(password) && password === confirmPassword;
  };

  const isStep1Complete = firstName && lastName && validateEmail(email);
  const isStep2Complete = phoneVerified;
  const isStep3Complete = phone && verificationCode;
  const isStep4Complete = address && city && state && validatePostalCode(postalCode);
  const isStep5Complete = gender && birthdate && new Date().getFullYear() - birthdate.getFullYear() >= 18;
  const isStep6Complete = isPasswordValid();

  const sendVerificationCode = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Verification code sent to your phone.');
      } else {
        const { message } = await response.json();
        Alert.alert('Error', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    }
  };

  const verifyCode = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code: verificationCode }),
      });

      if (response.ok) {
        const { message } = await response.json();
        if (message === 'Phone number verified successfully') {
          setPhoneVerified(true);
          Alert.alert('Success', message);
          handleNextStep(); // Move to the next step
        } else {
          Alert.alert('Error', message);
        }
      } else {
        const { message } = await response.json();
        Alert.alert('Error', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(false);
    setBirthdate(currentDate);
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setProfilePicture(`data:image/jpeg;base64,${asset.base64}`);
      }
    });
  };
  
  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };
    launchCamera(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setProfilePicture(`data:image/jpeg;base64,${asset.base64}`);
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => (step > 1 ? handlePreviousStep() : navigation.goBack())}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796b" />
        ) : (
          <Image source={logo} style={styles.logo} />
        )}
      </View>
      <Text style={styles.title}>Create Your Billix Account</Text>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
          {!validateEmail(email) && email.length > 0 && (
            <Text style={styles.errorText}>Please enter a valid email address.</Text>
          )}
          <TouchableOpacity style={[styles.button, !isStep1Complete && styles.buttonDisabled]} onPress={handleNextStep} disabled={!isStep1Complete}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <PhoneInput
            style={styles.input_verify}
            placeholder="Phone Number"
            value={phone}
            onChangePhoneNumber={setPhone}
            initialCountry="us"
            autoFormat
          />
          <TouchableOpacity style={[styles.button, !phone && styles.buttonDisabled]} onPress={sendVerificationCode} disabled={!phone}>
            <Text style={styles.buttonText}>Send Verification Code</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input_verify}
            placeholder="Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={[styles.button, !verificationCode && styles.buttonDisabled]} onPress={verifyCode} disabled={!verificationCode}>
            <Text style={styles.buttonText}>Verify Code</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Apartment, Suite, etc. (optional)"
            value={apartment}
            onChangeText={setApartment}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#888"
          />
          <Dropdown
            style={styles.input}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={stateOptions}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="State/Province"
            searchPlaceholder="Search..."
            value={state}
            onChange={item => {
              setState(item.value);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Postal Code"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          {!validatePostalCode(postalCode) && postalCode.length > 0 && (
            <Text style={styles.errorText}>Please enter a valid postal code.</Text>
          )}
          <TouchableOpacity style={[styles.button, !isStep4Complete && styles.buttonDisabled]} onPress={handleNextStep} disabled={!isStep4Complete}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={genderOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            value={gender}
            onChange={item => {
              setGender(item.value);
            }}
          />
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>
              {birthdate ? birthdate.toDateString() : 'Select Birthdate'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <TouchableOpacity style={[styles.button, !isStep5Complete && styles.buttonDisabled]} onPress={handleNextStep} disabled={!isStep5Complete}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 5 && (
        <View style={styles.stepContainer}>
            <View style={styles.imageContainer}>

          <Image
            source={profilePicture ? { uri: profilePicture } : profileIcon}
            style={styles.profileImage}
          />
            </View>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>Pick an Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.photoButtonText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, !profilePicture && styles.buttonDisabled]} onPress={handleNextStep} disabled={!profilePicture}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 6 && (
        <View style={styles.stepContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          {!isPasswordValid() && password.length > 0 && (
            <Text style={styles.errorText}>Password must match and include special characters, numbers, and letters, and be at least 6 characters long.</Text>
          )}
          <TouchableOpacity style={[styles.button, !isStep6Complete && styles.buttonDisabled]} onPress={handleNextStep} disabled={!isStep6Complete}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 7 && (
<View style={styles.stepContainer}>
  <TouchableOpacity style={styles.termsButton} onPress={() => setShowTermsModal(true)}>
    <Text style={styles.termsButtonText}>View Terms of Service</Text>
  </TouchableOpacity>
  <Modal visible={showTermsModal} animationType="slide">
    <View style={styles.termsContainer}>
      <ScrollView>
        <Text style={styles.termsText}>[Your terms of service here]</Text>
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={() => setShowTermsModal(false)}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </Modal>
  
  <TouchableOpacity style={styles.termsButton} onPress={() => setShowPrivacyModal(true)}>
    <Text style={styles.termsButtonText}>View Privacy Policy</Text>
  </TouchableOpacity>
  <Modal visible={showPrivacyModal} animationType="slide">
    <View style={styles.termsContainer}>
      <ScrollView>
        <Text style={styles.termsText}>[Your privacy policy here]</Text>
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={() => setShowPrivacyModal(false)}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </Modal>

  <View style={styles.checkBoxesContainer}>
    <View style={styles.checkBoxContainer}>
      <CheckBox
        value={termsAccepted}
        onValueChange={setTermsAccepted}
        tintColors={{ true: '#00796b', false: '#888' }}
      />
      <Text style={styles.checkBoxText}>I accept the Terms of Service</Text>
    </View>

    <View style={styles.checkBoxContainer}>
      <CheckBox
        value={privacyAccepted}
        onValueChange={setPrivacyAccepted}
        tintColors={{ true: '#00796b', false: '#888' }}
      />
      <Text style={styles.checkBoxText}>I accept the Privacy Policy</Text>
    </View>
  </View>

  <TouchableOpacity style={[styles.button, (!termsAccepted || !privacyAccepted) && styles.buttonDisabled]} onPress={handleSignUp} disabled={!termsAccepted || !privacyAccepted}>
    <Text style={styles.buttonText}>Sign Up</Text>
  </TouchableOpacity>
</View>
      )}
      {step === 1 && (
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
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
    backgroundColor: '#e0f7e0', // Light green background
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 75,
    backgroundColor: '#ffffff', // White background for the logo
    padding: 10,
    elevation: 5, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
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
    color: '#00796b', // Dark teal color
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
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
  input_verify: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#00796b', // Dark teal border color
    borderRadius: 25,
    padding: 15,
    marginTop: 20,
    marginBottom: 0,
    backgroundColor: '#ffffff', // White background
    color: '#333',
    elevation: 3, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdown: {
    height: 50,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 8,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  datePickerButton: {
    width: '100%',
    height: 50,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkBoxText: {
    marginLeft: 8,
    color: '#00796b', // Dark teal color
    fontSize: 16,
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
  buttonDisabled: {
    backgroundColor: '#999', // Gray color for disabled button
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#00796b', // Dark teal color
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backButtonText: {
    color: '#00796b', // Dark teal color
    fontSize: 18,
  },
  termsButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 10,
    backgroundColor: '#00796b',
  },
  termsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f7e0', // Light green background
  },
  termsText: {
    color: '#00796b', // Dark teal color
    fontSize: 14,
  },
  closeButton: {
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  photoButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Adjust this margin as needed
  },
});

export default SignUpScreen;
