import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const EarningPointsScreen = ({ points, consecutiveDaysLoggedIn, updatePoints, updateConsecutiveDays }) => {
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  const earningActivities = [
    { id: '1', title: 'Sign-Up and Profile Completion', pointsEarned: 50, totalPoints: 50, progress: 100 },
    { id: '2', title: 'First Swap Completion', pointsEarned: 100, totalPoints: 100, progress: 100 },
    { id: '3', title: 'Recurring Swaps', pointsEarned: 20, totalPoints: 200, progress: 10 },
    { id: '4', title: 'Referrals', pointsEarned: 100, totalPoints: 100, progress: 50 },
    { id: '6', title: 'Surveys', pointsEarned: 10, totalPoints: 100, progress: 40 },
    { id: '7', title: 'Daily Poll Participation', pointsEarned: 5, totalPoints: 50, progress: 80 },
  ];

  const claimDailyBonus = () => {
    if (!dailyBonusClaimed) {
      const bonusPoints = consecutiveDaysLoggedIn % 7 === 0 ? 25 : 10;
      const newPoints = points + bonusPoints;

      updatePoints(newPoints);
      updateConsecutiveDays(consecutiveDaysLoggedIn + 1);
      setDailyBonusClaimed(true);

      Alert.alert('Success', `You have claimed ${bonusPoints} daily login points!`);
    } else {
      Alert.alert('Info', 'You have already claimed your daily bonus.');
    }
  };

  useEffect(() => {
    // Reset the daily bonus claim status when the component mounts
    setDailyBonusClaimed(false);
  }, []);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Earn Points with Billix</Text>
        <Text style={styles.subText}>Complete activities to earn points and unlock rewards. Keep track of your progress below.</Text>
      </View>
      <View style={styles.dailyBonusCard}>
        <Text style={styles.text}>Daily Login Bonus</Text>
        <Text style={styles.description}>
          Consecutive Days Logged In: {consecutiveDaysLoggedIn}/7
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${(consecutiveDaysLoggedIn % 7) * 14.3}%` }, // 7 days = 100% (each day ~14.3%)
            ]}
          />
        </View>
        <TouchableOpacity style={styles.claimButton} onPress={claimDailyBonus}>
          <Text style={styles.claimButtonText}>Claim Daily Bonus</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        {earningActivities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <Text style={styles.text}>{activity.title}</Text>
            <Text style={styles.description}>
              Points Earned: {activity.pointsEarned}/{activity.totalPoints}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${activity.progress}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: '#F08080', // Light red background
    paddingHorizontal: 10,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C62828', // Dark red
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  dailyBonusCard: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#ffcccc', // Softer red color for better flow with the theme
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: '48%', // Two cards per row
    aspectRatio: 1, // Square shape
    marginVertical: 10,
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
    width: '100%',
  },
  progress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#C62828', // Dark red progress bar
  },
  claimButton: {
    backgroundColor: '#C62828', // Dark red button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EarningPointsScreen;
