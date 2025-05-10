import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const steps = [
  'Analyzing your bill’s swappable portion...',
  'Scanning nearby bills in the variance pool...',
  'Filtering by due date, trust score, and category...',
  'Simulating optimal swap combinations...',
  'Finalizing your Billix match...',
];

const FindMatches = ({ route }) => {
  const { bill } = route.params || {};
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [noMatches, setNoMatches] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: steps.length * 2000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < steps.length) {
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            handleFindMatches(); // ✅ Actual match call
          }, 1500);
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatDateToYMD = (dateString) => {
    const [month, day, year] = dateString.split('/');
    if (!month || !day || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  

  const handleFindMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formattedDueDate = formatDateToYMD(bill?.due_date);
        if (!formattedDueDate) {
          console.error('❌ Invalid date format from bill.due_date:', bill?.due_date);
          setNoMatches(true);
          return;
        }

      const res = await axios.post(
        'http://127.0.0.1:5000/find-matches',
        {
          billType: bill.bill_type,
          swappable_amount: bill.swappable_amount,
          dueDate: formattedDueDate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.matchFound) {
        navigation.navigate('MatchResults', {
          swapId: res.data.swap_id,
          matchedWith: res.data.matched_with,
          amount: res.data.amount,
          dueDate: res.data.due_date,
        });
      } else {
        setNoMatches(true);
      }
    } catch (error) {
      console.error('❌ Error finding matches:', error.response?.data || error.message);
      setNoMatches(true);
    }
  };

  return (
    <View style={styles.container}>
      {noMatches ? (
        <View style={styles.waitingRoom}>
          <Text style={styles.waitingTitle}>No Match Found (Yet)</Text>
          <Text style={styles.waitingText}>
            Your bill is now circulating in the Billix Matching Pool.{'\n\n'}
            Most swaps occur within **1 to 3 hours**, depending on availability.
          </Text>
          <Text style={styles.tip}>
            You’ll be notified as soon as a compatible swap is found.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.header}>Matching You with the Best Swap</Text>
          <ActivityIndicator size="large" color="#4A7C59" style={{ marginBottom: 20 }} />
          <Text style={styles.step}>{steps[currentStep]}</Text>

          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.footer}>
            {currentStep < steps.length - 1
              ? 'Searching for your best match...'
              : 'Finalizing match results...'}
          </Text>

          <View style={styles.bottomBox}>
            <Text style={styles.helperLabel}>Why just $50?</Text>
            <Text style={styles.helperText}>
              To protect our growing community, Billix only makes a portion of your bill swappable.
              {bill?.swappable_amount
                ? ` In your case, that's $${bill.swappable_amount.toFixed(2)}.`
                : ` This amount is capped at $50.`}
            </Text>
            <Text style={styles.helperHint}>
              You stay in control. Upload any bill, pick your “Billixable Amount,” and match instantly.
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 6,
    textAlign: 'center',
  },
  step: {
    fontSize: 16,
    marginVertical: 18,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
  },
  footer: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#dcdcdc',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#4A7C59',
  },
  waitingRoom: {
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 12,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  backBtn: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomBox: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  helperLabel: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#4A7C59',
  },
  helperText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  helperHint: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
  },
});

export default FindMatches;
