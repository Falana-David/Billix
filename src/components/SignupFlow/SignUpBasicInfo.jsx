// Sign-up flow with validation, state selection, and dynamic buttons
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { Switch } from 'react-native';

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

const SignUpBasicInfo = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone,
  isOver18,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setPhone,
  setIsOver18,
  handleNextStep,
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [state, setState] = useState('');

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

  const isPasswordValid = () =>
    password.length >= 6 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*#?&]/.test(password) &&
    password === confirmPassword;

  const isStepComplete =
    firstName &&
    lastName &&
    validateEmail(email) &&
    isPhoneValid() &&
    isPasswordValid() &&
    isOver18 &&
    state;

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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} placeholderTextColor="#888" />
            <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} placeholderTextColor="#888" />
          </>
        );
      case 1:
        return (
          <>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#888" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={(text) => {
                const formatted = formatPhone(text);
                setPhone(formatted);
                if (!validatePhoneUS(formatted)) setCodeSent(false);
              }}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
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
            <TextInput style={styles.input} placeholder="Enter Verification Code" value={code} onChangeText={setCode} keyboardType="numeric" placeholderTextColor="#888" />
            {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
            <TouchableOpacity
              style={[styles.button, code.length === 0 && styles.buttonDisabled]}
              onPress={verifyCode}
              disabled={code.length === 0 || verifying}
            >
              <Text style={styles.buttonText}>{verifying ? 'Verifying...' : 'Confirm Code'}</Text>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#888" />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor="#888" />
          </>
        );
      case 4:
        return (
          <>
            <Text style={{ marginBottom: 8 }}>Select Your State</Text>
<Dropdown
  style={styles.dropdown}
  data={US_STATES.map(s => ({ label: s, value: s }))}
  labelField="label"
  valueField="value"
  placeholder="Select State"
  value={state}
  onChange={item => setState(item.value)}
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
      default:
        return null;
    }
  };

  const progress = ((step + 1) / 5) * 100;

  return (
    <Animated.View style={[styles.container, { opacity: animation }]}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.heading}>Let’s get started</Text>
      <Text style={styles.subheading}>Step {step + 1} of 5</Text>

      {renderStep()}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        {step > 0 && (
          <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 10 }]} onPress={() => setStep(step - 1)}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 4 && step !== 2 && (
          <TouchableOpacity style={[styles.button, !codeSent && step === 1 && styles.buttonDisabled, { flex: 1 }]} onPress={() => setStep(step + 1)} disabled={step === 1 && !codeSent}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
        {step === 4 && (
          <TouchableOpacity
            style={[styles.button, !isStepComplete && styles.buttonDisabled, { flex: 1 }]}
            onPress={handleNextStep}
            disabled={!isStepComplete}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
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
  
});

export default SignUpBasicInfo;
