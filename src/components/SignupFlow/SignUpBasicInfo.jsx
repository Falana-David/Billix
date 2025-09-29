// Sign-up flow with validation, state selection, and dynamic buttons
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Switch } from 'react-native';
import { Buffer } from 'buffer';
import TermsScreen from '../HomeScreenFlow/Profile_Information/TermsScreen';
import { useNavigation } from '@react-navigation/native';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const toBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const reader = new FileReader();
  return await new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ── NEW: helpers for ZIP ──────────────────────────────────────────────────────
const validateZip = (z) => {
  if (!z) return false;
  const v = z.trim();
  return /^\d{5}$/.test(v) || /^\d{5}-\d{4}$/.test(v); // 5 or ZIP+4
};

const formatZip = (text) => {
  // allow digits and one optional hyphen for ZIP+4
  const digits = text.replace(/\D/g, '').slice(0, 9); // up to 9 digits
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const SignUpBasicInfo = ({
  firstName, lastName, email, password, confirmPassword, phone,
  isOver18, gender, setGender, setFirstName, setLastName, setEmail, setPassword,
  setConfirmPassword, setPhone, setIsOver18, handleNextStep, profileImage, setProfileImage,
  referralCode, setReferralCode,
  // ── NEW: add these two props from parent ──
  zip, setZip,
}) => {

  const [animation] = useState(new Animated.Value(0));
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [state, setState] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [zipError, setZipError] = useState(''); // ── NEW
  const navigation = useNavigation();
  const [termsVisible, setTermsVisible] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{0,4})$/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`.replace(/-$/, '');
    return cleaned;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.toLowerCase());
  const validatePhoneUS = (phone) => /^\d{3}-\d{3}-\d{4}$/.test(phone);
  const isPhoneValid = () => phone.replace(/\D/g, '').length === 10;

  const getPasswordStrength = (pass) => {
    if (!pass || pass.length < 6) return 'Weak';
    if (pass.length >= 8 && /[A-Za-z]/.test(pass) && /\d/.test(pass) && /[@$!%*#?&]/.test(pass)) return 'Strong';
    if (/[A-Za-z]/.test(pass) && /\d/.test(pass)) return 'Medium';
    return 'Weak';
  };

  const passwordStrength = getPasswordStrength(password);

  const pickProfileImage = () => {
    launchImageLibrary({}, async (res) => {
      if (res.assets?.length > 0) {
        const uri = res.assets[0].uri;
        const base64 = await toBase64(uri);
        setProfileImage(base64);
      }
    });
  };

  const isPasswordValid = () =>
    password.length >= 6 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*#?&]/.test(password) &&
    password === confirmPassword;

  const sendCode = async () => {
    const cleaned = phone.replace(/\D/g, '');
    try {
      const res = await fetch('http://127.0.0.1:5000/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+1${cleaned}` }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setCodeSent(true);
      } else {
        throw new Error(data.message || 'Error sending code');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const verifyCode = async () => {
    setVerifying(true);
    setVerificationError('');
    try {
      const cleaned = phone.replace(/\D/g, '');
      const res = await fetch('http://127.0.0.1:5000/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+1${cleaned}`, code }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setStep(step + 1);
      } else {
        setVerificationError(data.message || 'Invalid code');
        setCode('');
        setCodeSent(false);
        setStep(step - 1);
      }
    } catch (err) {
      setVerificationError('Verification failed');
      setCode('');
      setCodeSent(false);
      setStep(step - 1);
    } finally {
      setVerifying(false);
    }
  };

  // ── UPDATED: require ZIP at step 4 ──────────────────────────────────────────
  const stepChecks = [
    () => firstName && lastName,                                  // 0
    () => validateEmail(email) && isPhoneValid() && !emailError && !phoneError && codeSent, // 1
    () => code.length > 0,                                        // 2
    () => isPasswordValid(),                                      // 3
    () => state && isOver18 && validateZip(zip) && !zipError,     // 4  <-- ZIP added
    () => hasAgreedToTerms,                                       // 5
    () => true,                                                   // 6
    () => true,                                                   // 7
  ];

  const handleNext = async () => {
    if (step === 2) {
      verifyCode();
    } else if (step === 6) {
      setStep((s) => s + 1); // advance if valid or empty
    } else if (step < 7) {
      setStep((s) => s + 1);
    } else {
      handleNextStep();
    }
  };

  const renderFooter = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
      {step > 0 && step < 7 && (
        <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 10 }]} onPress={() => setStep((s) => s - 1)}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, !stepChecks[step]() && styles.buttonDisabled, { flex: 1 }]}
        onPress={handleNext}
        disabled={!stepChecks[step]()}
      >
        <Text style={styles.buttonText}>{step === 2 ? 'Confirm Code' : step === 7 ? 'Finish' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
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
          </>
        );

      case 1:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(val) => {
                const trimmed = val.trim().toLowerCase();
                setEmail(trimmed);
                if (!validateEmail(trimmed)) {
                  setEmailError('Please enter a valid email address');
                } else {
                  setEmailError('');
                }
              }}
              keyboardType="email-address"
              placeholderTextColor="#888"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={(text) => {
                const formatted = formatPhone(text);
                setPhone(formatted);
                setCodeSent(false);
                if (!validatePhoneUS(formatted)) {
                  setPhoneError('Enter a valid 10-digit US phone number');
                } else {
                  setPhoneError('');
                }
              }}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, !isPhoneValid() && styles.buttonDisabled]}
              onPress={sendCode}
              disabled={!isPhoneValid()}
            >
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter Verification Code"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
            {verificationError ? <Text style={styles.errorText}>{verificationError}</Text> : null}
          </>
        );

      case 3:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholderTextColor="#888"
            />

            <Text style={{ marginTop: 5, color: '#888' }}>
              Password Strength: {passwordStrength}
            </Text>
          </>
        );

      case 4:
        return (
          <>
            <Dropdown
              style={styles.dropdown}
              data={US_STATES.map((s) => ({ label: s, value: s }))}
              labelField="label"
              valueField="value"
              placeholder="Select State"
              value={state}
              onChange={(item) => setState(item.value)}
            />

            {/* ── NEW: ZIP input ───────────────────────────── */}
            <TextInput
              style={styles.input}
              placeholder="ZIP Code (e.g., 12345 or 12345-6789)"
              value={zip}
              onChangeText={(text) => {
                const formatted = formatZip(text);
                setZip(formatted);
                if (!validateZip(formatted)) {
                  setZipError('Enter a valid US ZIP (12345 or 12345-6789)');
                } else {
                  setZipError('');
                }
              }}
              keyboardType="number-pad"
              maxLength={10} // 12345-6789
              placeholderTextColor="#888"
            />
            {zipError ? <Text style={styles.errorText}>{zipError}</Text> : null}

            <Dropdown
              style={styles.dropdown}
              data={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              labelField="label"
              valueField="value"
              placeholder="Select Gender"
              value={gender}
              onChange={(item) => setGender(item.value)}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
              <Switch
                value={isOver18}
                onValueChange={setIsOver18}
                trackColor={{ false: '#ccc', true: '#00796b' }}
                thumbColor={isOver18 ? '#ffffff' : '#f4f3f4'}
              />
              <Text style={{ marginLeft: 8 }}>I confirm I am 18 or older</Text>
            </View>
          </>
        );

      case 5:
        return (
          <>
            <TouchableOpacity style={styles.button} onPress={() => setTermsVisible(true)}>
              <Text style={styles.buttonText}>View Terms & Privacy</Text>
            </TouchableOpacity>

            {hasAgreedToTerms && (
              <Text style={{ color: '#00796b', marginTop: 10, textAlign: 'center' }}>
                You've agreed to the Terms & Privacy Policy.
              </Text>
            )}
          </>
        );

      case 6:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Referral Code (Optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              placeholderTextColor="#888"
            />
          </>
        );

      case 7:
        return (
          <>
            <Text style={styles.heading}>Upload a Profile Photo</Text>
            {profileImage && <Image source={{ uri: profileImage }} style={styles.imagePreview} />}
            <TouchableOpacity style={styles.button} onPress={pickProfileImage}>
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Animated.View style={[styles.container, { opacity: animation }]}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${((step + 1) / 8) * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackButton}>
          <Text style={styles.topBackButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Let’s get started</Text>
        <Text style={styles.subheading}>Step {step + 1} of 8</Text>

        {renderStep()}

        {renderFooter()}
      </Animated.View>

      <Modal visible={termsVisible} animationType="slide">
        <TermsScreen
          onAgree={() => {
            setHasAgreedToTerms(true);
            setTermsVisible(false);
          }}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  subheading: { fontSize: 16, marginBottom: 15, color: '#555' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#00796b',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
  errorText: { color: 'red', fontSize: 13, marginBottom: 5, paddingLeft: 10 },
  progressContainer: {
    height: 8,
    backgroundColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00796b',
    width: '0%',
  },
  button: {
    height: 50,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    height: 50,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  imagePreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, alignSelf: 'center' },
  topBackButton: {
    marginBottom: 10,
  },
  topBackButtonText: {
    color: '#00796b',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SignUpBasicInfo;
