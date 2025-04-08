import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import EarningPointsScreen from './EarningPointsScreen';
import RedeemingPointsScreen from './RedeemingPointsScreen';

const RewardsScreen = () => {
  const [points, setPoints] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Earning Points');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Server response:', text);

      if (response.ok) {
        const data = JSON.parse(text);
        setPoints(data.points);
      } else {
        console.error('Failed to fetch user data:', text);
      }
    };

    fetchUserData();
  }, []);

  const updatePoints = async (newPoints) => {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:5000/update-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ points: newPoints }),
    });

    if (response.ok) {
      setPoints(newPoints);
    } else {
      console.error('Failed to update points');
    }
  };

  const handleRedeemReward = async (rewardId, rewardCost) => {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:5000/redeem-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reward_id: rewardId, reward_cost: rewardCost }),
    });

    if (response.ok) {
      const newPoints = points - rewardCost;
      setPoints(newPoints);
    } else {
      console.error('Failed to redeem reward');
    }
  };

  const renderContent = () => {
    if (selectedTab === 'Earning Points') {
      return <EarningPointsScreen points={points} updatePoints={updatePoints} />;
    } else {
      return <RedeemingPointsScreen points={points} handleRedeemReward={handleRedeemReward} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Rewards" style={styles.header} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Earning Points' && styles.activeTab]}
          onPress={() => setSelectedTab('Earning Points')}
        >
          <Text style={[styles.tabText, selectedTab === 'Earning Points' && styles.activeTabText]}>Earning Points</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Redeeming Points' && styles.activeTab]}
          onPress={() => setSelectedTab('Redeeming Points')}
        >
          <Text style={[styles.tabText, selectedTab === 'Redeeming Points' && styles.activeTabText]}>Redeeming Points</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F08080', // Light red background for the overall page
  },
  header: {
    backgroundColor: '#C62828', // Dark red background for the header
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#C62828', // Dark red background for the tab container
    paddingVertical: 12,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#F08080', // Light red text color for tabs
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF', // White underline for the active tab
  },
  activeTabText: {
    color: '#FFFFFF', // White text color for the active tab
    fontWeight: 'bold',
  },
});

export default RewardsScreen;
