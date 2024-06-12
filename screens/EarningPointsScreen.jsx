import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const EarningPointsScreen = ({ claimPoints }) => {
  const earningActivities = [
    { id: '1', title: 'Bill Uploads', description: 'Earn 10 points per bill upload. Bonus points for larger bills: 1 point for every $10 above $100.' },
    { id: '2', title: 'Daily Check-ins', description: 'Earn 5 points for daily app check-in. Streak bonus: Additional 10 points for checking in every day for a week.' },
    { id: '3', title: 'Referrals', description: 'Earn 50 points for each friend referred who signs up and uploads their first bill.' },
    { id: '4', title: 'Surveys and Quizzes', description: 'Earn 15 points for completing surveys related to financial habits. Earn 20 points for completing quizzes about personal finance.' },
    { id: '5', title: 'Promotional Offers', description: 'Earn 25 points for participating in special promotional offers or campaigns.' },
    { id: '6', title: 'Shopping', description: 'Earn 2 points per dollar spent in the app’s shop.' },
    { id: '7', title: 'Emergency Bill Payments', description: 'Earn 50 points for helping pay someone else\'s emergency bill request.' },
  ];

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Earning Points</Text>
        {earningActivities.map(activity => (
          <View key={activity.id} style={styles.activity}>
            <Text style={styles.text}>{activity.title}</Text>
            <Text style={styles.description}>{activity.description}</Text>
            <TouchableOpacity style={styles.button} onPress={() => claimPoints(10)}>
              <Text style={styles.buttonText}>Claim Points</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5fa052',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#7F7F7F',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  activity: {
    marginBottom: 15,
  },
});

export default EarningPointsScreen;
