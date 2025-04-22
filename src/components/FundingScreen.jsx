import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const fundingOpportunities = [
  {
    title: 'Try a Free Gym Session at LevelUp Fitness',
    reward: '$15 Bill Credit',
    location: 'Atlanta Only',
    time: '30 mins',
  },
  {
    title: 'Review a New Coffee Shop Menu',
    reward: '$10 Bill Credit',
    location: 'Available Nationwide',
    time: '15 mins',
  },
  {
    title: 'Attend a Local Tech Demo Night',
    reward: '$20 Bill Credit',
    location: 'Austin, TX',
    time: '1 hr',
  },
];

const FundingScreen = () => {
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: '',
    requestDescription: '',
    rewardAmount: '',
    location: '',
    taskDuration: '',
  });

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleFormSubmit = () => {
    // Future: Send formData to backend
    alert('Your request has been submitted!');
    setShowForm(false);
    setFormData({
      businessName: '',
      contactEmail: '',
      requestDescription: '',
      rewardAmount: '',
      location: '',
      taskDuration: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Earn Bill Credits by Trying New Things</Text>
        <Text style={styles.subheader}>
          Businesses sponsor your bills when you try their services. Explore current offers below:
        </Text>

        {fundingOpportunities.map((item, index) => (
          <View key={index} style={styles.cardContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDetail}>💵 {item.reward}</Text>
            <Text style={styles.cardDetail}>📍 {item.location}</Text>
            <Text style={styles.cardDetail}>⏱️ {item.time}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Join This Opportunity</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.bottomCTA}>
          <Text style={styles.partnerText}>Have a business?</Text>
          <View style={{ marginTop: 6 }}>
  <TouchableOpacity onPress={() => setShowForm(true)}>
    <Text style={styles.partnerLink}>
      Sponsor Tasks and Help Pay Bills →
    </Text>
  </TouchableOpacity>
</View>

        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeader}>Submit a Sponsorship Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={formData.businessName}
              onChangeText={(text) => handleInputChange('businessName', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Email"
              keyboardType="email-address"
              value={formData.contactEmail}
              onChangeText={(text) => handleInputChange('contactEmail', text)}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="What do you want users to do?"
              multiline
              value={formData.requestDescription}
              onChangeText={(text) => handleInputChange('requestDescription', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Reward Amount (e.g., $15)"
              value={formData.rewardAmount}
              onChangeText={(text) => handleInputChange('rewardAmount', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Nationwide or City)"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Expected Time (e.g., 15 mins)"
              value={formData.taskDuration}
              onChangeText={(text) => handleInputChange('taskDuration', text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleFormSubmit}>
              <Text style={styles.buttonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    color: '#4A7C59',
  },
  subheader: {
    fontSize: 15,
    textAlign: 'center',
    color: '#3B3B3B',
    marginVertical: 12,
    paddingHorizontal: 6,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F5D4A',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 14,
    color: '#3B3B3B',
    marginBottom: 2,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4A7C59',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomCTA: {
    marginTop: 24,
    alignItems: 'center',
  },
  partnerText: {
    fontSize: 15,
    color: '#2F5D4A',
    fontWeight: '600',
  },
  partnerLink: {
    fontSize: 15,
    color: '#4A7C59',
    textDecorationLine: 'underline',
    marginTop: 6,
  },
  formContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderColor: '#DFF5E1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
});

export default FundingScreen;
