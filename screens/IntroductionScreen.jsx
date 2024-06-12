import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import LottieView from 'lottie-react-native';

const slides = [
  {
    key: 'one',
    title: 'Welcome to Billix!',
    text: 'Manage your bills effortlessly and get rewarded.',
    animation: require('../assests/Page1.json'), // Add your Lottie file
    backgroundColor: '#5fa052',
  },
  {
    key: 'two',
    title: 'Track Your Expenses',
    text: 'Keep an eye on your spending and save more.',
    animation: require('../assests/Page2.json'), // Add your Lottie file
    backgroundColor: '#7e57c2',
  },
  {
    key: 'three',
    title: 'Earn Rewards',
    text: 'Get points for paying bills and redeem them for exciting rewards.',
    animation: require('../assests/Page3.json'), // Add your Lottie file
    backgroundColor: '#ffcc00',
  },
];

const IntroductionScreen = ({ navigation }) => {
  return (
    <Swiper loop={false}>
      {slides.map((slide) => (
        <View style={[styles.slide, { backgroundColor: slide.backgroundColor }]} key={slide.key}>
          <LottieView source={slide.animation} autoPlay loop style={styles.animation} />
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.text}>{slide.text}</Text>
        </View>
      ))}
      <View style={styles.slide}>
        <Text style={styles.title}>Get Started!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default IntroductionScreen;
