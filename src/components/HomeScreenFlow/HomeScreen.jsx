import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { UserContext } from '../UserContext';
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning';
    else if (currentHour < 18) return 'Good Afternoon';
    else return 'Good Evening';
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleImagePress = (imageName) => {
    if (imageName === 'Share Bill') {
      navigation.navigate('StarterBill');
    } else {
      console.log(`${imageName} image pressed`);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainWrapper}>
          {/* Top Profile Section */}
          <View style={styles.centeredProfileContainer}>
            <Image
              source={user?.profilePicture ? { uri: user.profilePicture } : require('../assets/logo.png')}
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{getGreeting()}, {user?.firstName || 'Ronald Richards'}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starCard}>
                <Text style={styles.ratingText}>4.5</Text>
                <Image source={require('../assets/star.png')} style={styles.starIcon} />
              </View>
            </View>
            <Image source={require('../assets/Frame.png')} style={styles.bellIcon} />
          </View>

          {/* Collapsible Bill Activity Section */}
          <TouchableOpacity onPress={toggleCollapse} style={styles.collapsibleHeader}>
            <Text style={styles.collapsibleText}>Bill Activity</Text>
          </TouchableOpacity>

          {!isCollapsed && (
            <View style={styles.collapsibleContent}>
              <TouchableOpacity onPress={() => handleImagePress('Pending')}>
                <View style={styles.pendingContainer}>
                  <Image source={require('../assets/pending.png')} style={styles.imagePending} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImagePress('Completed')}>
                <View style={styles.completedContainer}>
                  <Image source={require('../assets/completed.png')} style={styles.imageCompleted} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImagePress('Active')}>
                <View style={styles.activeContainer}>
                  <Image source={require('../assets/active.png')} style={styles.imageActive} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Swap & Share Buttons */}
          <View style={styles.swapButtonRow}>
            <TouchableOpacity style={styles.swapButton} onPress={() => handleImagePress('Swap Bill')}>
              <Image source={require('../assets/SwapBill.png')} style={styles.swapImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.swapButton} onPress={() => handleImagePress('Share Bill')}>
              <Image source={require('../assets/ShareBill.png')} style={styles.swapImage} />
            </TouchableOpacity>
          </View>

          {/* Main Content Section */}
          <View style={styles.mainContent}>
            {/* Review */}
            <View style={styles.reviewContainer}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewHeaderText}>Review</Text>
                <Image source={require('../assets/logo.png')} style={styles.reviewProfilePic} />
              </View>
              <Text style={styles.reviewText}>
                “Great design and super easy to use—managing finances has never been simpler!”
              </Text>
              <View style={styles.reviewFooter}>
                <View style={styles.reviewRating}>
                  <Image source={require('../assets/star.png')} style={styles.starIcon} />
                  <Text style={styles.reviewRatingText}>4.5</Text>
                </View>
                <View style={styles.reviewNav}>
                  <Text style={styles.navArrow}>{"<"}</Text>
                  <Text style={styles.navArrow}>{">"}</Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsWrapper}>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => handleImagePress('Chat')}>
                  <View style={styles.buttonCard}>
                    <Image source={require('../assets/chat-button-home.png')} style={styles.buttonImage} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleImagePress('Funding')}>
                  <View style={styles.buttonCard}>
                    <Image source={require('../assets/funding-button-home.png')} style={styles.buttonImage} />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => handleImagePress('FAQ')}>
                  <View style={styles.buttonCard}>
                    <Image source={require('../assets/faq-button-home.png')} style={styles.buttonImage} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleImagePress('Vote')}>
                  <View style={styles.buttonCard}>
                    <Image source={require('../assets/voting-button-home.png')} style={styles.buttonImage} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F8EC' },
  container: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  mainWrapper: {
    backgroundColor: '#FFFFFF',
    width: '92%',
    borderRadius: 25,
    padding: 25,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  centeredProfileContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  bellIcon: {
    width: 28,
    height: 28,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 10, color: '#1A1A1A' },
  dateText: { fontSize: 16, color: '#777', marginTop: 5 },
  ratingContainer: { marginTop: 10 },
  starCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: { fontSize: 18, fontWeight: 'bold', color: '#4A7C59', marginRight: 5 },
  starIcon: { width: 20, height: 20 },
  swapButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 30,
    gap: 12,
  },
  swapButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  // swapImage: { width: '100%', height: 120, resizeMode: 'contain' },
  collapsibleHeader: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  collapsibleText: { fontSize: 18, fontWeight: 'bold', color: '#4A7C59' },
  collapsibleContent: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  pendingContainer: {
    width: '100%',
    height: 168,
    backgroundColor: '#FCF3E8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePending: { width: '90%', height: '90%', resizeMode: 'contain' },
  completedContainer: {
    width: '100%',
    height: 62,
    backgroundColor: '#F0F8EC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageCompleted: { width: '90%', height: '90%', resizeMode: 'contain' },
  activeContainer: {
    width: '100%',
    height: 62,
    backgroundColor: '#E8F4FC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageActive: { width: '90%', height: '90%', resizeMode: 'contain' },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    width: '50%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewHeaderText: { fontSize: 16, color: '#4A7C59', fontWeight: 'bold' },
  reviewProfilePic: { width: 40, height: 40, borderRadius: 20 },
  reviewText: { fontSize: 16, color: '#4A7C59', marginVertical: 10 },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewRating: { flexDirection: 'row', alignItems: 'center' },
  reviewRatingText: { fontSize: 16, marginLeft: 5 },
  reviewNav: { flexDirection: 'row' },
  navArrow: { fontSize: 18, marginHorizontal: 10 },
  buttonsWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    width: '45%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 23 },
  buttonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonImage: { width: 96, height: 96 },
});

export default HomeScreen;