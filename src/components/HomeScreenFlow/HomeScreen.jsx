import React, { useState, useContext, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { UserContext } from '../UserContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useContext(UserContext);
  const [referralCode, setReferralCode] = useState('');
  const navigation = useNavigation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const handleImagePress = (label) => {
    if (label === 'Share Bill') navigation.navigate('StarterBill');
    else if (label === 'Swap Bill') navigation.navigate('Upload');
    else if (label === 'ChatListScreen') navigation.navigate('ChatListScreen');
    else if (label === 'Funding') navigation.navigate('FundingScreen');
    else if (label === 'FAQ') navigation.navigate('FAQScreen');
    else if (label === 'Vote') navigation.navigate('DailyVoteScreen');
    else if (label === 'Pending') navigation.navigate('Pending');
    else if (label === 'Active') navigation.navigate('Active');
    else if (label === 'MyCompleted') navigation.navigate('MyCompleted');
    else if (label === 'BillSharesScreen') navigation.navigate('BillSharesScreen');
    else if (label === 'HelpScreen') navigation.navigate('HelpScreen');
    else console.log(`${label} pressed`);
  };
  
  const handleInvitePress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/generate-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (res.ok && data.code) {
        setReferralCode(data.code);
        Clipboard.setString(data.code);
        alert(`Invite code ${data.code} copied to clipboard!`);
      } else {
        alert(data.message || 'Unable to generate referral code.');
      }
    } catch (err) {
      console.error('Referral error:', err);
      alert('Something went wrong. Please try again.');
    }
  };
  
  

  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    // Simulate fetching user data or bill data
    setTimeout(() => {
      // Ideally, call any data fetching here
      setRefreshing(false);
    }, 1000);
  };


  const featureButtons = [
    { label: 'ChatListScreen', icon: require('../assets/chat-button-home.png') },
    { label: 'Funding', icon: require('../assets/funding-button-home.png') },
    { label: 'FAQ', icon: require('../assets/faq-button-home.png') },
    { label: 'Vote', icon: require('../assets/voting-button-home.png') },
  ];

  const readAlongSteps = [
    "👋 Welcome to Billix! This is your profile section. You can manage trust, verification, and see your overall identity.",
    "📊 View your bill activity using the collapsible dropdown labeled 'Bill Activity'.",
    "⭐ This is your Trust Score. Higher scores unlock faster matches and better rewards.",
    "🧾 Use the Share Bill button to explore public bills and earn reward spins for helping.",
    "🔁 The Swap Bill button lets you post your own bills and get help from others!",
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showReadAlong, setShowReadAlong] = useState(false);
  
  useEffect(() => {
    const checkIfFirstTime = async () => {
      // Wait briefly to ensure AsyncStorage has been written from SignUp
      await new Promise((res) => setTimeout(res, 500)); // short delay
  
      const seen = await AsyncStorage.getItem('hasSeenReadAlong');
      if (seen === 'false') {
        setShowReadAlong(true);
        await AsyncStorage.setItem('hasSeenReadAlong', 'true'); // mark as seen
      }
    };
  
    checkIfFirstTime();
  }, []);
  
  
  const handleNextStep = () => {
    if (currentStep < readAlongSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowReadAlong(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      {showReadAlong && (
  <View style={styles.readAlongOverlay}>
    <View style={styles.readAlongBox}>
      <Text style={styles.readAlongText}>{readAlongSteps[currentStep]}</Text>
      <TouchableOpacity onPress={handleNextStep}>
        <Text style={styles.readAlongButton}>
          {currentStep === readAlongSteps.length - 1 ? 'Done' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)}


     <ScrollView
      contentContainerStyle={styles.mainWrapper}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >

{/* PROFILE HEADER */}
<View style={styles.profileContainer}>
  <View style={styles.profileRow}>
    <Image
      source={user?.profilePicture ? { uri: user.profilePicture } : require('../assets/logo.png')}
      style={styles.profileImage}
    />
    <Text style={styles.userName}>{getGreeting()}, {user?.firstName || 'Ronald Richards'}</Text>
    <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
    <View style={styles.badgeRow}>
    <TouchableOpacity
  style={[styles.badge, { backgroundColor: '#b9e7c9' }]}
  onPress={() => navigation.navigate('TrustScoreScreen')}
>
  <Text style={[styles.badgeText, { color: '#287d42' }]}>
    ★ {user?.trustScore ? user.trustScore.toFixed(2) : '4.50'} / 5
  </Text>
</TouchableOpacity>


      <View style={[styles.badge, { backgroundColor: '#e0f5e7' }]}>
        <Text style={[styles.badgeText, { color: '#3d8b3d' }]}>Verified</Text>
      </View>
    </View>
    {/* Replaced bell icon with a custom green version */}
    {/* <Image source={require('../assets/Frame.png')} style={styles.bellIcon} /> */}
  </View>
</View>


{/* BILL ACTIVITY */}
<TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)} style={styles.collapsibleHeader}>
  <Text style={styles.collapsibleText}>Bill Activity</Text>
</TouchableOpacity>
{!isCollapsed && (
  <View style={styles.sectionContainer}>
    <TouchableOpacity onPress={() => handleImagePress('Active')}>
      <Image source={require('../assets/active.png')} style={styles.billImage} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleImagePress('MyCompleted')}>
      <Image source={require('../assets/completed.png')} style={styles.billImageSmall} />
    </TouchableOpacity>
    {/* <TouchableOpacity onPress={() => handleImagePress('Active')}>
      <Image source={require('../assets/active.png')} style={styles.billImageSmall} />
    </TouchableOpacity> */}
  </View>
)}

{/* CTA BUTTONS ROW 1 */}
<View style={styles.sectionContainer}>
  <View style={styles.ctaRow}>
    <TouchableOpacity onPress={() => handleImagePress('Share Bill')} style={styles.ctaBox}>
      <Image source={require('../assets/ShareBill.png')} style={styles.ctaIcon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleImagePress('Swap Bill')} style={styles.ctaBox}>
      <Image source={require('../assets/SwapBill.png')} style={styles.ctaIcon} />
    </TouchableOpacity>
  </View>
</View>

{/* Row 3 – Exchange Bills */}
<View style={styles.sectionContainer}>
  <View style={styles.singleCtaRow}>
    <TouchableOpacity onPress={() => handleImagePress('BillSharesScreen')}>
      <Image source={require('../assets/exchange-bills.png')} style={styles.ctaIconDoubleRow} />
    </TouchableOpacity>
  </View>
</View>

{/* Row 4 – Bill Shares */}
<View style={styles.sectionContainer}>
  <View style={styles.singleCtaRow}>
    <TouchableOpacity onPress={() => handleImagePress('HelpScreen')}>
      <Image source={require('../assets/learn_more.png')} style={styles.ctaIconSingleRow} />
    </TouchableOpacity>
  </View>
</View>


{/* REVIEW */}
{/* REVIEW SECTION */}
{/* REVIEW SECTION */}
<View style={styles.reviewCard}>
  <View style={styles.reviewCardHeader}>
    <Text style={styles.reviewCardTitle}>Write a Review</Text>
    <Image source={require('../assets/logo.png')} style={styles.reviewCardIcon} />
  </View>
  <Text style={styles.reviewCardSubtext}>Tell us how Billix is helping you or share ideas to make it even better.</Text>
  <TouchableOpacity
    style={styles.reviewButton}
    onPress={() => navigation.navigate('WriteReviewScreen')}
  >
    <Text style={styles.reviewButtonText}>Write a Review</Text>
  </TouchableOpacity>
</View>



{/* FEATURE CAROUSEL */}
<View style={[styles.sectionContainer, styles.featureCarouselWrapper]}>
  <FlatList
    data={featureButtons}
    keyExtractor={(item) => item.label}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleImagePress(item.label)}>
        <Image source={item.icon} style={styles.carouselImage} />
      </TouchableOpacity>
    )}
    onScroll={(e) => {
      const { contentOffset, layoutMeasurement } = e.nativeEvent;
      const page = Math.floor(contentOffset.x / layoutMeasurement.width);
      setCurrentPage(page);
    }}
    
    
  />
  <View style={styles.pagination}>
    {featureButtons.map((_, i) => (
      <View key={i} style={[styles.dot, { backgroundColor: i === currentPage ? '#4A7C59' : '#ccead7' }]} />
    ))}
  </View>
</View>

{/* REFER A FRIEND */}
{/* REFER A FRIEND */}
<View style={styles.referContainer}>
  <Image source={require('../assets/logo.png')} style={styles.referImage} />
  <Text style={styles.referTitle}>Refer a Friend</Text>
  <Text style={styles.referText}>
    Invite your friends and earn bill credits when they join and help others!
  </Text>

  <TouchableOpacity style={styles.referButton} onPress={handleInvitePress}>
    <Text style={styles.referButtonText}>Invite Now</Text>
  </TouchableOpacity>

  {referralCode && (
    <Text style={{ marginTop: 10, color: '#3A7542' }}>
      Your Code: <Text style={{ fontWeight: 'bold' }}>{referralCode}</Text>
    </Text>
  )}
</View>



</ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexGrow: 1,
    paddingBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#E6F5E9', // soft lavender-blue
  },  
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F5E9',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  profileRow: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#d0e7d8',
    backgroundColor: '#ccc',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    color: '#1A1A1A',
  },
  dateText: {
    fontSize: 14,
    color: '#6b6b6b',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 13,
  },
  bellIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  collapsibleHeader: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginTop: 10,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
  },
  collapsibleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  activityRow: {
    marginTop: 16,
    marginBottom: 24,
    width: '100%',
    gap: 12,
  },
  billImage: {
    width: '100%',
    height: 160,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  billImageSmall: {
    width: '100%',
    height: 60,
    resizeMode: 'contain',
    borderRadius: 12,
    marginTop: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  ctaBox: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#f5fdf6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIcon: {
    width: 188,
    height: 188,
    padding:12,
    resizeMode: 'contain',
  },
  singleCtaRow: {
    // width: '100%',
    marginVertical: 10,
    alignItems: 'center',
    
  },
  singleCtaBoxLarge: {
    // width: '95%',   // wider than the default
    // height: 120,    // taller than the default
    backgroundColor: '#f5fdf6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIconSingleRow: {
    width: 350,
    height: 141,
    resizeMode: 'contain',
  },
  ctaIconDoubleRow: {
    width: 490,
    height: 90,
    resizeMode: 'contain',
  },

  profileContainer: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 20,
    elevation: 2,
  },
  
  reviewCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    width: '100%',
  },
  
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  reviewCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A7542',
  },
  
  reviewCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  
  reviewCardSubtext: {
    fontSize: 14,
    color: '#4A7C59',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'left',
  },
  
  reviewButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  
  readAlongText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  
  readAlongButton: {
    textAlign: 'right',
    color: '#4A7C59',
    fontWeight: '600',
    fontSize: 15,
  },
  
  starIcon: {
    width: 18,
    height: 18,
  },
  reviewNav: {
    flexDirection: 'row',
  },
  navArrow: {
    fontSize: 18,
    color: '#6b6b6b',
    marginHorizontal: 8,
  },
  featureCarouselWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  carouselImage: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
    marginHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    elevation: 1,
  },
  referContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  referImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A7542',
    marginBottom: 6,
  },
  referText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4A7C59',
    marginBottom: 12,
    lineHeight: 20,
  },
  referButton: {
    backgroundColor: '#3A7542',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  referButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  readAlongOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    zIndex: 999,
  },
  readAlongBox: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#f0f0f0', // ← Light grey
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  
  
  
});

export default HomeScreen;
