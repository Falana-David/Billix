import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const WelcomeToBillSwap = () => {
  const navigation = useNavigation();
  const [playVideo, setPlayVideo] = useState(false);

  const handlePlay = () => setPlayVideo(true);

  // Reset video when leaving and coming back to screen
  useFocusEffect(
    useCallback(() => {
      return () => setPlayVideo(false);
    }, [])
  );

  const navigateToBillSwap = () => {
    navigation.navigate('StartSwap');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <Image source={require('./assets/logo.png')} style={styles.logo} /> */}
        <Text style={styles.title}>Welcome to Bill Swap</Text>
      </View>

      {/* Video Section */}
      <View style={styles.videoContainer}>
        {!playVideo ? (
          <TouchableOpacity style={styles.thumbnailWrapper} onPress={handlePlay}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.thumbnail}
            />
            <LinearGradient
              colors={['#ffffffee', '#ffffff00']}
              style={styles.fadeTop}
            />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <View style={styles.textOverlay}>
              <Text style={styles.videoIntro}>Introduction</Text>
              {/* <Text style={styles.videoTitle}>How to find and navigate to the bill swap page.</Text> */}
            </View>
          </TouchableOpacity>
        ) : (
          <Video
            source={require('./assets/Billix_Final_Animation.mp4')}
            style={styles.video}
            resizeMode="contain"
            controls
            muted={false}
          />
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Bill Swap is your go-to solution for managing bills effectively. Watch the video to learn how you can start swapping bills and take control of your finances today.
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={navigateToBillSwap}>
        <Text style={styles.buttonText}>Start Swapping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a6351',
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    height: 270,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e2f0e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 80,
    width: '100%',
    zIndex: 1,
  },
  playButton: {
    position: 'absolute',
    top: '42%',
    backgroundColor: '#3a6351',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    zIndex: 2,
  },
  playIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  videoIntro: {
    fontSize: 14,
    color: '#6a7c75',
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontSize: 17,
    color: '#4a5c55',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 15,
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
});

export default WelcomeToBillSwap;
