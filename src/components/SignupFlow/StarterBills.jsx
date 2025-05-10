import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

const StarterBills = () => {
  const route = useRoute();
  const addOns = route.params?.addOns;
  const bill = route.params?.bill;

  let displayBills = [
    {
      id: 1,
      amount: 6.43,
      type: 'Wi-Fi Bill',
      user: '@brokegrad',
      state: 'Illinois',
      date: 'Due April 22',
      description: 'Keeping Wi-Fi alive for job interviews.',
      reason: 'I just need a little help this week. Thank you 💙',
      reward: 'Earn 1.2 Bill Credits',
      icon: '📶',
      profilePicture: require('../assets/logo.png'),
    },
    {
      id: 2,
      amount: 4.10,
      type: 'Lunch Tab',
      user: '@mealmate',
      state: 'California',
      date: 'Posted Apr 5',
      description: 'Lunch with Grandma.',
      reason: 'Every bit counts—I’m working 3 jobs right now.',
      reward: '+1 Boost toward your Bill Cap',
      icon: '🍔',
      profilePicture: require('../assets/logo.png'),
    },
    {
      id: 3,
      amount: 2.99,
      type: 'Spotify',
      user: '@vibesonly',
      state: 'New York',
      date: 'Due April 18',
      description: 'Spotify for daily commutes.',
      reason: 'Trying to keep my cat entertained!',
      reward: 'Earn 0.5 Bill Credits',
      icon: '🎵',
      profilePicture: require('../assets/logo.png'),
    },
  ];

  if (addOns?.publicPost && bill) {
    displayBills.unshift({
      id: 999,
      amount: parseFloat(bill.amount_due),
      type: bill.bill_type || 'Bill',
      user: '@you',
      state: 'Your State',
      date: `Due ${bill.due_date}`,
      description: 'Your bill was posted publicly.',
      reason: 'You made this public to get matched faster!',
      reward: 'Earn 1.5 Bill Credits',
      icon: '🧾',
      profilePicture: require('../assets/logo.png'),
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.header}>Pick a Bill to Support</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      >
        {displayBills.map((bill) => (
          <FlipCard key={bill.id} bill={bill} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const FlipCard = ({ bill }) => {
  const [flipped, setFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const handleFlip = () => {
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    Animated.spring(animatedValue, {
      toValue: newFlipped ? 180 : 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1}>
      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }] },
            flipped && styles.hidden
          ]}
        >
          <View style={styles.topRow}>
            <Image source={bill.profilePicture} style={styles.profileImageLarge} />
            <View style={styles.userDetails}>
              <Text style={styles.user}>{bill.user}</Text>
              <Text style={styles.state}>{bill.state}</Text>
            </View>
            <Text style={styles.icon}>{bill.icon}</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.amount}>${bill.amount.toFixed(2)}</Text>
            <Text style={styles.type}>{bill.type}</Text>
            <Text style={styles.date}>{bill.date}</Text>
            <Text style={styles.description}>{bill.description}</Text>
            <Text style={styles.reward}>{bill.reward}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
            !flipped && styles.hidden
          ]}
        >
          <Text style={styles.reason}>{bill.reason}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 30,
    color: '#4A7C59',
  },
  carousel: {
    paddingBottom: 20,
  },
  cardWrapper: {
    width: screenWidth * 0.75,
    height: 400,
    marginHorizontal: 10,
    perspective: 1000,
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 18,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: '#EAF2E7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  hidden: {
    opacity: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImageLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  userDetails: {
    flex: 1,
    marginLeft: 10,
  },
  user: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  state: {
    fontSize: 12,
    color: '#888',
  },
  icon: {
    fontSize: 28,
    marginLeft: 10,
  },
  cardContent: {
    paddingTop: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 6,
  },
  type: {
    fontSize: 16,
    color: '#2F5D4A',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    marginBottom: 12,
  },
  reward: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: 'bold',
  },
  reason: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#4A4A4A',
    textAlign: 'center',
  },
});

export default StarterBills;
