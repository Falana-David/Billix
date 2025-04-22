import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import { UserContext } from './UserContext'; // Import UserContext
import logo from './assets/qqq.png'; // Update the path as necessary

const MAX_ATTEMPTS = 5; // Maximum allowed login attempts
const LOCKOUT_DURATION = 5 * 60 * 1000; // Lockout duration in milliseconds (5 minutes)

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(UserContext); // Use UserContext to set user information
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);

  useEffect(() => {
    const loadLoginData = async () => {
      const savedEmail = await AsyncStorage.getItem('email');
      const savedLockoutEndTime = await AsyncStorage.getItem('lockoutEndTime');

      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }

      if (savedLockoutEndTime) {
        setLockoutEndTime(new Date(parseInt(savedLockoutEndTime, 10)));
      }
    };
    loadLoginData();
  }, []);

  useEffect(() => {
    if (lockoutEndTime && new Date() > lockoutEndTime) {
      setLockoutEndTime(null);
      AsyncStorage.removeItem('lockoutEndTime');
      setAttempts(0); // Reset attempts after lockout period ends
    }
  }, [lockoutEndTime]);

  const handleLogin = async () => {
    if (lockoutEndTime && new Date() <= lockoutEndTime) {
      Alert.alert('Error', 'Account is locked. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        const { token, firstName, profilePicture } = data;

        // Check if the values are not undefined before saving
        if (token && firstName && profilePicture) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('firstName', firstName);
          await AsyncStorage.setItem('profilePicture', profilePicture);
          login(token, firstName, profilePicture); // Set user information in context
        } else {
          console.error('Received undefined values from API:', {
            token,
            firstName,
            profilePicture,
          });
          Alert.alert('Error', 'Failed to retrieve user data. Please try again.');
        }

        if (rememberMe) {
          await AsyncStorage.setItem('email', email);
        } else {
          await AsyncStorage.removeItem('email');
        }

        setAttempts(0); // Reset attempts on successful login
        setLoading(false);
        navigation.navigate('Home'); // Redirect to home or dashboard screen
      } else {
        const { message } = await response.json();
        setLoading(false);
        handleFailedLogin();
        Alert.alert('Error', message);
      }
    } catch (error) {
      setLoading(false);
      handleFailedLogin();
      Alert.alert('Error', 'Failed to log in. Please try again.');
    }
  };

  const handleFailedLogin = () => {
    setAttempts(prevAttempts => {
      const newAttempts = prevAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION);
        setLockoutEndTime(lockoutTime);
        AsyncStorage.setItem('lockoutEndTime', lockoutTime.getTime().toString());
        Alert.alert(
          'Account Locked',
          'Too many failed attempts. Your account is locked for 5 minutes.'
        );
      }
      return newAttempts;
    });
  };

  const handleForgotPassword = async () => {
    try {
      if (email) {
        const response = await fetch('http://127.0.0.1:5000/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const { message } = await response.json();
        Alert.alert('Success', message);
      } else {
        Alert.alert('Error', 'Please enter your email address');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
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
      <Text style={styles.title}>Welcome Back To Billix</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <View style={styles.rememberMeContainer}>
        <CheckBox
          value={rememberMe}
          onValueChange={setRememberMe}
          tintColors={{ true: '#00796b', false: '#888' }} // Adjust the colors to match your design
        />
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
  <Text style={styles.linkText}>Forgot Password?</Text>
  </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}>
          <Text style={styles.footerText}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}> | </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://your-terms-of-service-url.com')}>
          <Text style={styles.footerText}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}> | </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://your-support-url.com')}>
          <Text style={styles.footerText}>Help and Support</Text>
        </TouchableOpacity>
      </View>
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rememberMeText: {
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
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  footerText: {
    color: '#00796b', // Dark teal color
    fontSize: 12,
    marginHorizontal: 3,
  },
});

export default LoginScreen;
