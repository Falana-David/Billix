import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const samplePoll = {
  question: "Which category should get extra support tomorrow?",
  options: [
    "Utility Bills",
    "Rent/Mortgage",
    "Medical Expenses",
    "Phone & Internet",
  ],
};

export const DailyVoteScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, endOfDay - now);
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVote = () => {
    if (selected === null) {
      Alert.alert("Please select an option before voting.");
      return;
    }
    setVoted(true);
    Alert.alert("✅ Vote Submitted", "Thanks for helping guide tomorrow’s support!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Daily Community Vote</Text>
        <Text style={styles.subText}>Help shape where support flows tomorrow.</Text>

        <View style={styles.countdownBox}>
          <Text style={styles.countdownText}>
            Voting ends in {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.pollBox}>
          <Text style={styles.pollQuestion}>{samplePoll.question}</Text>
          {samplePoll.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionBox, selected === index && styles.optionBoxSelected]}
              onPress={() => setSelected(index)}
              disabled={voted}
            >
              <Text
                style={[styles.optionText, selected === index && styles.optionTextSelected]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.voteButton, voted && styles.voteButtonDisabled]}
            onPress={handleVote}
            disabled={voted}
          >
            <Text style={styles.voteButtonText}>{voted ? "Voted" : "Submit Vote"}</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 10,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    color: '#4A7C59',
  },
  subText: {
    fontSize: 14,
    color: '#4A7C59',
    textAlign: 'center',
    marginBottom: 10,
  },
  countdownBox: {
    backgroundColor: '#DFF5E1',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F5D4A',
  },
  pollBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F5D4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#DFF5E1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  optionBoxSelected: {
    backgroundColor: '#DFF5E1',
    borderColor: '#4A7C59',
  },
  optionText: {
    fontSize: 16,
    color: '#2F5D4A',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#004D3B',
  },
  voteButton: {
    marginTop: 10,
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    backgroundColor: '#A9CBB2',
  },
  voteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DailyVoteScreen;
