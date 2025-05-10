import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const rewards = [
  { name: 'Freeze Token', value: 'Delays one bill swap for 7 days', odds: 0.20 },
  { name: 'Giveaway Entry', value: 'Entry into $50 bill wipeout giveaway', odds: 0.25 },
  { name: 'Insurance 2X Trial Token', value: 'One-time Emergency Coverage trial', odds: 0.10 },
  { name: 'Post Publicly Add-On', value: 'Free public post add-on (normally paid)', odds: 0.10 },
  { name: 'Priority Matching', value: 'Speeds up bill matching', odds: 0.15 },
  { name: 'Trust Score +0.1', value: 'Small trust score boost', odds: 0.10 },
  { name: '10 Billix Points', value: 'Earn 10 in-app points', odds: 0.10 },
];

const screenWidth = Dimensions.get('window').width;
const wheelSize = screenWidth * 0.85;
const radius = wheelSize / 2;
const sliceAngle = 360 / rewards.length;
const colors = ['#C8F7DC', '#A0EEC5', '#D4FAF0', '#E6F8E0', '#C5E0DC', '#E2F0D9', '#D1E8E2'];

const polarToCartesian = (angle, r = radius) => {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: radius + r * Math.cos(rad),
    y: radius + r * Math.sin(rad),
  };
};

const getTrianglePath = (startAngle, endAngle) => {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  return `M${radius},${radius} L${start.x},${start.y} L${end.x},${end.y} Z`;
};

const wrapText = (text, maxWordsPerLine = 2) => {
  const words = text.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine).join(' '));
  }
  return lines;
};

const Wheels = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [hasSpunToday, setHasSpunToday] = useState(false); // ✅ Move here
  const navigation = useNavigation();

  useEffect(() => {
    const checkLastSpin = async () => {
      const today = new Date().toDateString();
      const lastSpin = await AsyncStorage.getItem('lastSpinDate');
      if (lastSpin === today) {
        setHasSpunToday(true);
      }
    };
    checkLastSpin();
  }, []);
  const getWeightedRandomIndex = () => {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < rewards.length; i++) {
      cumulative += rewards[i].odds;
      if (rand < cumulative) return i;
    }
    return rewards.length - 1;
  };

  const spinWheel = () => {
    if (hasSpunToday) {
        Alert.alert('Already Spun', 'You can only spin once per day. Come back tomorrow!');
        return;
      }
      
    if (spinning) return;
    setSpinning(true);
    const randomIndex = getWeightedRandomIndex();
    const fullSpins = 6;
    const targetAngle = 360 * fullSpins + (rewards.length - randomIndex) * sliceAngle;

    Animated.timing(spinAnim, {
      toValue: targetAngle,
      duration: 5000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(async () => {
      spinAnim.setValue(targetAngle % 360);
      const reward = rewards[randomIndex];
      setSelectedReward(reward);
      await AsyncStorage.setItem('lastSpinDate', new Date().toDateString());
      setHasSpunToday(true); // optional if you want to update state too
      setSpinning(false);

      try {
        const token = await AsyncStorage.getItem('token');
        await fetch('http://127.0.0.1:5000/spin-reward', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: reward.name,
            description: reward.value,
          }),
        });
      } catch (err) {
        console.warn('Reward save failed', err);
      }

      setTimeout(() => {
        Alert.alert('Reward Saved!', `You got: ${reward.name}`, [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      }, 10000);
    });
  };

  const rotation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spin the Billix Reward Wheel</Text>

      <View style={styles.wheelWrapper}>
        <View style={styles.pointer} />
        <Animated.View style={[styles.wheel, { transform: [{ rotate: rotation }] }]}>
          <Svg width={wheelSize} height={wheelSize}>
            <G origin={`${radius}, ${radius}`}>
              {rewards.map((reward, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                const midAngle = (startAngle + endAngle) / 2;
                const labelRadius = radius * 0.65;
                const { x, y } = polarToCartesian(midAngle, labelRadius);
                const lines = wrapText(reward.name);

                return (
                  <G key={i}>
                    <Path
                      d={getTrianglePath(startAngle, endAngle)}
                      fill={colors[i % colors.length]}
                      stroke="#4A7C59"
                      strokeWidth={1}
                    />
                    {lines.map((line, idx) => (
                      <SvgText
                        key={idx}
                        x={x}
                        y={y + idx * 12 - (lines.length - 1) * 6}
                        fill="#000"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {line}
                      </SvgText>
                    ))}
                  </G>
                );
              })}
            </G>
          </Svg>

          <TouchableOpacity style={styles.spinHub} onPress={spinWheel} disabled={spinning}>
            <Text style={styles.hubText}>{spinning ? 'Spinning...' : 'SPIN'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {selectedReward && (
        <View style={styles.resultBox}>
          <Text style={styles.rewardTitle}>{selectedReward.name}</Text>
          <Text style={styles.rewardDescription}>{selectedReward.value}</Text>
        </View>
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
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2F5D4A',
  },
  wheelWrapper: {
    width: wheelSize,
    height: wheelSize + 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  wheel: {
    width: wheelSize,
    height: wheelSize,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spinHub: {
    position: 'absolute',
    width: wheelSize * 0.3,
    height: wheelSize * 0.3,
    borderRadius: wheelSize * 0.15,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  hubText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pointer: {
    position: 'absolute',
    top: 15,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2F5D4A',
  },
  resultBox: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderColor: '#AAD7B4',
    borderWidth: 1,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
});

export default Wheels;
