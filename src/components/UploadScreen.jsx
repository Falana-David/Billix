import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const WelcomeToBillSwap = () => {
  const navigation = useNavigation();

  const navigateToBillSwap = () => {
    navigation.navigate('StartSwap'); // Ensure this matches your route name
  };
  

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome to Bill Swap</Text>
      </View>

      {/* Video Placeholder Section */}
     {/* Intro Video Section */}
<View style={styles.videoContainer}>
  <Video
    source={require('./assets/Billix_Final_Animation.mp4')} 
    style={styles.video}
    resizeMode="contain"
    controls
    repeat
    muted={false}
    onError={(e) => console.log('VIDEO ERROR:', e)}
    onLoad={() => console.log('Video loaded')}
  />
</View>


      {/* Description Section */}
      <Text style={styles.description}>
        Bill Swap is your go-to solution for managing bills effectively. Watch the video to learn how you can start swapping bills and take control of your finances today.
      </Text>

      {/* Button Section */}
      <TouchableOpacity style={styles.button} onPress={navigateToBillSwap}>
        <Text style={styles.buttonText}>Start Swapping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f1', // Light, calming background color
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a6351',
    textAlign: 'center',
  },
  videoContainer: {
    width: '90%',
    height: 200,
    backgroundColor: '#d9e8de',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoText: {
    fontSize: 16,
    color: '#7b8f82',
  },
  description: {
    fontSize: 18,
    color: '#4a5c55',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#3a6351',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  }
  
});

export default WelcomeToBillSwap;
