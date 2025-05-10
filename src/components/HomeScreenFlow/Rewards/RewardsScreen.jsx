import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  RefreshControl
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';

export const RewardsScreen = () => {
  const [points, setPoints] = useState(0);
  const [spinRewards, setSpinRewards] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeRewardIndex, setActiveRewardIndex] = useState(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const DAILY_POINTS = 5;

  const rewards = [
    { id: '1', title: 'Billix Fee Waiver', cost: 300, description: 'Waive the service fee on your next transaction.' },
    { id: '2', title: 'Priority Matching Boost', cost: 250, description: 'Get faster matching on your next bill post.' },
    { id: '3', title: 'Profile Badge: Trusted Helper', cost: 100, description: 'Earn a "Trusted Helper" badge for your profile.' },
    { id: '4', title: 'Swap Protection Credit ($10)', cost: 800, description: 'Earn a $10 insurance credit toward a future swap.' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPoints();
    await fetchSpinRewards();
    await checkDailyClaim();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPoints();
    fetchSpinRewards();
    checkDailyClaim();

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const interval = setInterval(() => {
      const now = new Date();
      if (now > endOfDay) {
        AsyncStorage.removeItem('lastDailyClaimDate').then(() => {
          setDailyClaimed(false);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPoints();
      fetchSpinRewards();
      checkDailyClaim();
    }, [])
  );

  const fetchPoints = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPoints(data.points || 0);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const fetchSpinRewards = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/get-wheel-rewards', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSpinRewards(data.rewards || []);
    } catch (error) {
      console.error('Failed to fetch spin rewards:', error);
    }
  };

  const claimSpinReward = async (rewardId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/claim-spin-reward', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reward_id: rewardId })
      });
      if (res.ok) {
        Alert.alert('Claimed!', 'Your spin reward has been claimed.');
        fetchSpinRewards();
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Failed to claim spin reward.');
      }
    } catch (error) {
      console.error('Failed to claim spin reward:', error);
    }
  };

  const checkDailyClaim = async () => {
    const lastClaim = await AsyncStorage.getItem('lastDailyClaimDate');
    const today = new Date().toDateString();
    setDailyClaimed(lastClaim === today);
  };

  const handleDailyClaim = async () => {
    if (dailyClaimed) {
      return Alert.alert('Already Claimed', 'Come back tomorrow!');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/claim-daily-points', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pointsToAdd: DAILY_POINTS }),
      });

      if (res.ok) {
        setPoints((prev) => prev + DAILY_POINTS);
        setDailyClaimed(true);
        await AsyncStorage.setItem('lastDailyClaimDate', new Date().toDateString());
        Alert.alert('Success', `You claimed ${DAILY_POINTS} daily points!`);
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Failed to claim daily points.');
      }
    } catch (error) {
      console.error('Error claiming daily points:', error);
      Alert.alert('Error', 'Failed to claim daily points.');
    }
  };

  const handleToggleReward = (index) => {
    setActiveRewardIndex(activeRewardIndex === index ? null : index);
  };

  const handleClaimReward = async (reward) => {
    if (points < reward.cost) {
      return Alert.alert('Not enough points');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/redeem-reward', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      if (res.ok) {
        setPoints((prev) => prev - reward.cost);
        Alert.alert('Claimed!', `${reward.title} has been claimed.`);
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Failed to claim reward.');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward.');
    }
  };

  const progress = selectedGoal ? Math.min(points / selectedGoal.cost, 1) : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4a9040" />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billix Points</Text>
          <Text style={styles.pointsText}>{points} Points Available</Text>
          <TouchableOpacity style={styles.dailyButton} onPress={handleDailyClaim}>
            <Text style={styles.dailyButtonText}>
              {dailyClaimed ? '✓ Daily Points Claimed' : `Claim ${DAILY_POINTS} Daily Points`}
            </Text>
          </TouchableOpacity>

          {selectedGoal && (
            <View style={styles.progressContainer}>
              <Progress.Circle
                size={150}
                progress={progress}
                showsText
                thickness={10}
                color="#4a9040"
                unfilledColor="#d6eadf"
                borderWidth={0}
                formatText={() => `${Math.round(progress * 100)}%`}
                textStyle={{ fontWeight: 'bold', fontSize: 18 }}
              />
              <Text style={styles.goalText}>Saving for: {selectedGoal.title}</Text>
              <Text style={styles.goalSubText}>{selectedGoal.cost} Points Needed</Text>
            </View>
          )}
        </View>

        {spinRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Spin Rewards (24h)</Text>
            {spinRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardCost}>Free • Expires Soon</Text>
                </View>
                <View style={styles.rewardBody}>
                  <Text style={styles.rewardDescription}>{reward.description}</Text>
                  <TouchableOpacity
                    style={[styles.claimButton, { backgroundColor: '#4a9040' }]}
                    onPress={() => claimSpinReward(reward.id)}
                  >
                    <Text style={styles.claimButtonText}>Claim Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          {rewards.map((reward, index) => {
            const isOpen = activeRewardIndex === index;
            const isGoal = selectedGoal?.id === reward.id;
            const canClaim = points >= reward.cost;

            return (
              <View key={reward.id} style={styles.rewardCard}>
                <TouchableOpacity style={styles.rewardHeader} onPress={() => handleToggleReward(index)}>
                  <View>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardCost}>{reward.cost} Points</Text>
                  </View>
                  <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={!isOpen}>
                  <View style={styles.rewardBody}>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setSelectedGoal(reward)}>
                      <Text style={styles.selectButtonText}>{isGoal ? '✓ Goal Set' : 'Set as Goal'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.claimButton, { backgroundColor: canClaim ? '#4a9040' : '#ccc' }]}
                      disabled={!canClaim}
                      onPress={() => handleClaimReward(reward)}
                    >
                      <Text style={styles.claimButtonText}>Claim Reward</Text>
                    </TouchableOpacity>
                  </View>
                </Collapsible>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f5e9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 40 : 80,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1f2937',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  dailyButton: {
    backgroundColor: '#4a9040',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dailyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#31733e',
  },
  goalSubText: {
    fontSize: 14,
    marginTop: 4,
    color: '#6b7280',
  },
  rewardCard: {
    backgroundColor: '#f3fcf5',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccece0',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomColor: '#d6eadf',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rewardCost: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#4a7c59',
  },
  rewardBody: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  claimButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});


export default RewardsScreen