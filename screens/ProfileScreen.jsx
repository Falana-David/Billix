import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, Easing, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import { PieChart } from 'react-native-chart-kit';
import ProfilePictureModal from './ProfilePictureModal';
import FinancialHealthScoreModal from './FinancialHealthScoreModal';
import SetGoalModal from './SetGoalModal';
import PostConfirmationModal from './PostConfirmationModal';
import Header from './Header';

const screenWidth = Dimensions.get('window').width;

const ranges = [
  { range: [300, 579], color: '#FF0000', label: 'Poor' },
  { range: [580, 669], color: '#FFA500', label: 'Fair' },
  { range: [670, 739], color: '#FFFF00', label: 'Good' },
  { range: [740, 799], color: '#3B7A57', label: 'Very Good' },
  { range: [800, 850], color: '#0000FF', label: 'Excellent' },
];

const getRangeColor = (score) => {
  for (const range of ranges) {
    if (score >= range.range[0] && score <= range.range[1]) {
      return range.color;
    }
  }
  return '#000000'; // Default color if no range is matched
};

const ProfileScreen = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [postConfirmationVisible, setPostConfirmationVisible] = useState(false);
  const [goal, setGoal] = useState({ title: '', description: '', amount: '', image: null });
  const [email, setEmail] = useState('johndoe@example.com');
  const [newCard, setNewCard] = useState('');
  const [cards, setCards] = useState(['**** **** **** 1234']);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch profile picture from AsyncStorage
      const profilePic = await AsyncStorage.getItem('profilePicture');
      setProfilePicture(profilePic);

      // Fetch points from Firestore
      const userId = 'example_user_id'; // Replace with actual user ID
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setPoints(userData.points);
        setEmail(userData.email);
      }
    };

    fetchProfileData();
  }, []);

  const choosePhotoFromLibrary = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (!response.didCancel && !response.errorCode) {
        const uri = response.assets[0].uri;
        setProfilePicture(uri);
        await AsyncStorage.setItem('profilePicture', uri);

        // Update Firestore
        const userId = 'example_user_id'; // Replace with actual user ID
        await firestore().collection('users').doc(userId).update({ profilePicture: uri });
      }
    });
  };

  const handleAddCard = () => {
    if (newCard) {
      setCards([...cards, newCard]);
      setNewCard('');
    }
  };

  const handleRemoveCard = (card) => {
    if (cards.length > 1) {
      setCards(cards.filter(c => c !== card));
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
    return gp2 + '*'.repeat(gp3.length);
  });

  const score = 750; // Example score
  const chartColor = getRangeColor(score);

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateChart = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const openScoreModal = () => {
    setScoreModalVisible(true);
    scale.setValue(0);
    opacity.setValue(0);
    animateChart();
  };

  const closeScoreModal = () => {
    setScoreModalVisible(false);
  };

  const openGoalModal = () => {
    setGoalModalVisible(true);
  };

  const closeGoalModal = () => {
    setGoalModalVisible(false);
  };

  const openPostConfirmation = () => {
    setPostConfirmationVisible(true);
  };

  const closePostConfirmation = () => {
    setPostConfirmationVisible(false);
  };

  const barChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [20, 45, 28, 80],
      },
    ],
  };

  const data = [
    {
      name: 'Score',
      score: score,
      color: chartColor,
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>User Information</Text>
          <TouchableOpacity onPress={choosePhotoFromLibrary}>
            <Image
              style={styles.profilePicture}
              source={profilePicture ? { uri: profilePicture } : require('../assests/upload.png')}
            />
          </TouchableOpacity>
          <Text style={styles.text}>Name: John Doe</Text>
          <Text style={styles.text}>Contact Information: {maskedEmail}</Text>
          <Text style={styles.pointsText}>Points: {points}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <Text style={styles.text}>Subscription Status: Active</Text>
          <Text style={styles.text}>Payment Methods:</Text>
          {cards.map((card, index) => (
            <View key={index} style={styles.cardContainer}>
              <Text>{card}</Text>
              {cards.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveCard(card)}>
                  <Text style={styles.removeCard}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Add new card"
            value={newCard}
            onChangeText={setNewCard}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddCard}>
            <Text style={styles.buttonText}>Add Card</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Financial Health Score</Text>
          <TouchableOpacity onPress={openScoreModal}>
            <PieChart
              data={data}
              width={screenWidth - 60}
              height={150}
              chartConfig={{
                backgroundColor: '#1cc910',
                backgroundGradientFrom: '#eff3ff',
                backgroundGradientTo: '#efefef',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="score"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Goals and Achievements</Text>
          <Text style={styles.text}>Active Savings Goals: Save $5000 for emergency fund</Text>
          <Text style={styles.text}>Achievements and Badges: Super Saver, Budget Master</Text>
          <TouchableOpacity style={styles.button} onPress={openGoalModal}>
            <Text style={styles.buttonText}>Set a New Goal</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Feedback and Support</Text>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ProfilePictureModal 
        visible={modalVisible}
        setVisible={setModalVisible}
        setProfilePicture={setProfilePicture}
      />

      <FinancialHealthScoreModal 
        visible={scoreModalVisible}
        setVisible={closeScoreModal}
        scale={scale}
        opacity={opacity}
        barChartData={barChartData}
      />

      <SetGoalModal 
        visible={goalModalVisible}
        setVisible={closeGoalModal}
        setGoal={setGoal}
        goal={goal}
        openPostConfirmation={openPostConfirmation}
      />

      <PostConfirmationModal 
        visible={postConfirmationVisible}
        setVisible={closePostConfirmation}
        goal={goal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navbar: {
    backgroundColor: '#5fa052',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
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
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeCard: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default ProfileScreen;
