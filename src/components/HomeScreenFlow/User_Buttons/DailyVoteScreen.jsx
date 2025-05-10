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
import AsyncStorage from '@react-native-async-storage/async-storage';


const samplePoll = {
  question: "Which category should get extra support tomorrow?",
  options: [
    "Utility Bills",
    "Rent/Mortgage",
    "Medical Expenses",
    "Phone & Internet",
  ],
};

const pollQuestions = [
  {
    question: "Save $5 today or earn $10 next week?",
    options: ["Save $5 today", "Earn $10 next week"],
  },
  {
    question: "Lower your electric bill or internet bill?",
    options: ["Lower electric bill", "Lower internet bill"],
  },
  {
    question: "Pay off debt faster or build savings first?",
    options: ["Pay off debt", "Build savings"],
  },
  {
    question: "5 small wins or 1 big win?",
    options: ["5 small wins", "1 big win"],
  },
  {
    question: "Automatic payments or manual control?",
    options: ["Automatic payments", "Manual control"],
  },
  {
    question: "$25 now or $50 in a month?",
    options: ["$25 now", "$50 in a month"],
  },
  {
    question: "Cancel a subscription or lower it by 50%?",
    options: ["Cancel subscription", "Lower by 50%"],
  },
  {
    question: "Lower grocery bill or gas bill?",
    options: ["Lower grocery bill", "Lower gas bill"],
  },
  {
    question: "Help one person fully or help two people partially?",
    options: ["Help one fully", "Help two partially"],
  },
  {
    question: "Free coffee for a month or $20 cash?",
    options: ["Free coffee", "$20 cash"],
  },
  {
    question: "Help a friend’s bill or a stranger’s bill?",
    options: ["Friend’s bill", "Stranger’s bill"],
  },
  {
    question: "Boost your credit score or lower your monthly expenses?",
    options: ["Boost credit score", "Lower expenses"],
  },
  {
    question: "Get a $10 Amazon gift card or $15 off a bill?",
    options: ["$10 Amazon card", "$15 off bill"],
  },
  {
    question: "Win a random prize or guaranteed $5 off?",
    options: ["Random prize", "Guaranteed $5 off"],
  },
  {
    question: "Lower insurance or lower utilities?",
    options: ["Lower insurance", "Lower utilities"],
  },
  {
    question: "Lower phone bill or lower internet?",
    options: ["Lower phone bill", "Lower internet bill"],
  },
  {
    question: "One large bill swap or three small swaps?",
    options: ["One large swap", "Three small swaps"],
  },
  {
    question: "10% off every bill for 3 months or 50% off one big bill?",
    options: ["10% off every bill", "50% off one big bill"],
  },
  {
    question: "Pay off smallest bill first or largest bill first?",
    options: ["Smallest bill first", "Largest bill first"],
  },
  {
    question: "1% cashback or $5 reward once a month?",
    options: ["1% cashback", "$5 reward monthly"],
  },
  {
    question: "Cancel unused apps or unused memberships?",
    options: ["Cancel apps", "Cancel memberships"],
  },
  {
    question: "Free Netflix for a year or $100 cash?",
    options: ["Free Netflix", "$100 cash"],
  },
  {
    question: "Emergency fund first or invest first?",
    options: ["Emergency fund", "Invest first"],
  },
  {
    question: "Round-up savings or set monthly savings?",
    options: ["Round-up savings", "Monthly savings"],
  },
  {
    question: "Cook at home or dine out with coupons?",
    options: ["Cook at home", "Dine out with coupons"],
  },
  {
    question: "Summer bill swap bonus or winter swap bonus?",
    options: ["Summer bonus", "Winter bonus"],
  },
  {
    question: "Mobile app only or mobile + web app?",
    options: ["Mobile app only", "Mobile + web app"],
  },
  {
    question: "Predictable rewards or surprise rewards?",
    options: ["Predictable rewards", "Surprise rewards"],
  },
  {
    question: "Lower rent or lower car insurance?",
    options: ["Lower rent", "Lower car insurance"],
  },
  {
    question: "Win prizes by luck or by completing tasks?",
    options: ["By luck", "By tasks"],
  },
  {
    question: "Save on entertainment or groceries?",
    options: ["Save on entertainment", "Save on groceries"],
  },
  {
    question: "Lower interest rate or shorter loan term?",
    options: ["Lower interest", "Shorter loan"],
  },
  {
    question: "1% lower APR or $200 cashback?",
    options: ["1% lower APR", "$200 cashback"],
  },
  {
    question: "Build bill points faster or save bill points for bigger prizes?",
    options: ["Build faster", "Save for bigger"],
  },
  {
    question: "Donate $5 to charity or win a $10 reward?",
    options: ["Donate $5", "Win $10"],
  },
  {
    question: "Save automatically or manually?",
    options: ["Save automatically", "Save manually"],
  },
  {
    question: "Freeze subscriptions during holidays or keep them running?",
    options: ["Freeze subscriptions", "Keep running"],
  },
  {
    question: "Win a mystery gift or $20 off a bill?",
    options: ["Mystery gift", "$20 off bill"],
  },
  {
    question: "Help 5 people $1 each or 1 person $5?",
    options: ["5 people $1 each", "1 person $5"],
  },
  {
    question: "Monthly swap challenge or weekly swap challenge?",
    options: ["Monthly challenge", "Weekly challenge"],
  },
  {
    question: "Earn badges or cash prizes?",
    options: ["Earn badges", "Cash prizes"],
  },
  {
    question: "Pay rent early for reward or pay on time for security?",
    options: ["Pay early", "Pay on time"],
  },
  {
    question: "Share tips for points or complete tasks for points?",
    options: ["Share tips", "Complete tasks"],
  },
  {
    question: "Use points for gift cards or bill discounts?",
    options: ["Gift cards", "Bill discounts"],
  },
  {
    question: "Help one-time or ongoing support?",
    options: ["One-time support", "Ongoing support"],
  },
  {
    question: "Pick your bill swap partner or random match?",
    options: ["Pick partner", "Random match"],
  },
  {
    question: "Earn a random bonus or a set bonus?",
    options: ["Random bonus", "Set bonus"],
  },
  {
    question: "Loyalty rewards or performance rewards?",
    options: ["Loyalty rewards", "Performance rewards"],
  },
  {
    question: "Save on home insurance or auto insurance?",
    options: ["Save on home insurance", "Save on auto insurance"],
  },
  {
    question: "Pay down credit cards or save for vacation?",
    options: ["Pay down credit cards", "Save for vacation"],
  }

];


export const DailyVoteScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const [currentPoll, setCurrentPoll] = useState(null);

useEffect(() => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );

  const pollIndex = dayOfYear % pollQuestions.length; 
  setCurrentPoll(pollQuestions[pollIndex]);
}, []);

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const interval = setInterval(async () => {
      const now = new Date();
      const diff = endOfDay - now;
    
      if (diff <= 0) {
        // Timer hit 00:00:00 — unlock voting
        setVoted(false);
        await AsyncStorage.removeItem('lastVoteDate');
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return; // stop further processing
      }
    
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
    }, 1000);
    

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkIfVoted = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastVote = await AsyncStorage.getItem('lastVoteDate');
      if (lastVote === todayStr) {
        setVoted(true); // 🔒 Lock vote until midnight
      }
    };
    checkIfVoted();
  }, []);
  

  const handleVote = async () => {
    if (selected === null) {
      Alert.alert("Please select an option before voting.");
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/claim-vote-points', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pointsToAdd: 5 }),
      });
      console.log('Response status:', res.status);
const text = await res.text();
console.log('Raw response:', text);

  
      if (res.ok) {
        setVoted(true);
        const todayStr = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem('lastVoteDate', todayStr); 
        Alert.alert("Vote Submitted", "Thanks for voting! You earned 5 points.");
      }
      else {
              const errorData = await res.json();
              Alert.alert('Error', errorData.message || 'Failed to claim vote points.');
            }
    } catch (error) {
      console.error('Error submitting vote:', error);
      Alert.alert('Error', 'You have already voted.');
    }
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
        <Text style={styles.pollQuestion}>{currentPoll?.question}</Text>
{currentPoll?.options.map((option, index) => (
  <TouchableOpacity
    key={index}
    style={[styles.optionBox, selected === index && styles.optionBoxSelected]}
    onPress={() => setSelected(index)}
    disabled={voted}
  >
    <Text style={[styles.optionText, selected === index && styles.optionTextSelected]}>
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
