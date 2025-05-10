import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../UserContext';

const WriteReviewScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reviewText || !rating) {
      Alert.alert('Missing Fields', 'Please provide both a rating and a review.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/submit-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${user?.firstName} ${user?.lastName}`,
          rating,
          review: reviewText,
        }),
      });

      if (response.ok) {
        Alert.alert('Thank you!', 'Your review has been submitted.');
        setReviewText('');
        setRating('');
        navigation.goBack();
      } else {
        const err = await response.json();
        Alert.alert('Error', err.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Write a Review</Text>
        <Text style={styles.subtitle}>We'd love to hear your thoughts on Billix.</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your rating (e.g., 4.5)"
          value={rating}
          onChangeText={setRating}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your review here..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F5E9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3A7542',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A7C59',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#b9e7c9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4A7C59',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    backgroundColor: '#E0F5E7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
  },
  backButtonText: {
    color: '#3A7542',
    fontSize: 15,
    fontWeight: '600',
  },
  
  
});

export default WriteReviewScreen;
