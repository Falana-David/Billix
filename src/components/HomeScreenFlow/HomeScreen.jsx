import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { UserContext } from '../UserContext';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const handleImagePress = (label) => {
    if (label === 'Share Bill') navigation.navigate('StarterBill');
    else if (label === 'Swap Bill') navigation.navigate('Upload');
    else if (label === 'Chat') navigation.navigate('ChatScreen');
    else if (label === 'Funding') navigation.navigate('FundingScreen');
    else if (label === 'FAQ') navigation.navigate('FAQScreen');
    else if (label === 'Vote') navigation.navigate('DailyVoteScreen');
    else console.log(`${label} pressed`);
  };
  

  const [currentPage, setCurrentPage] = useState(0);

  const featureButtons = [
    { label: 'Chat', icon: require('../assets/chat-button-home.png') },
    { label: 'Funding', icon: require('../assets/funding-button-home.png') },
    { label: 'FAQ', icon: require('../assets/faq-button-home.png') },
    { label: 'Vote', icon: require('../assets/voting-button-home.png') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
     <ScrollView contentContainerStyle={styles.mainWrapper}>

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
      <View style={[styles.badge, { backgroundColor: '#b9e7c9' }]}>
        <Text style={[styles.badgeText, { color: '#287d42' }]}>★ 4.5 / 5</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: '#e0f5e7' }]}>
        <Text style={[styles.badgeText, { color: '#3d8b3d' }]}>Verified</Text>
      </View>
    </View>
    {/* Replaced bell icon with a custom green version */}
    <Image source={require('../assets/Frame.png')} style={styles.bellIcon} />
  </View>
</View>


{/* BILL ACTIVITY */}
<TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)} style={styles.collapsibleHeader}>
  <Text style={styles.collapsibleText}>Bill Activity</Text>
</TouchableOpacity>
{!isCollapsed && (
  <View style={styles.sectionContainer}>
    <TouchableOpacity onPress={() => handleImagePress('Pending')}>
      <Image source={require('../assets/pending.png')} style={styles.billImage} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleImagePress('Completed')}>
      <Image source={require('../assets/completed.png')} style={styles.billImageSmall} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleImagePress('Active')}>
      <Image source={require('../assets/active.png')} style={styles.billImageSmall} />
    </TouchableOpacity>
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

{/* Row 3 */}
<View style={styles.sectionContainer}>
  <View style={styles.singleCtaRow}>
    {/* <TouchableOpacity style={styles.singleCtaBoxLarge}> */}
      <Image source={require('../assets/exchange-bills.png')} style={styles.ctaIconDoubleRow} />
    {/* </TouchableOpacity> */}
  </View>
</View>

{/* Row 4 */}
<View style={styles.sectionContainer}>
  <View style={styles.singleCtaRow}>
    {/* <TouchableOpacity style={styles.singleCtaBoxLarge}> */}
      <Image source={require('../assets/learn_more.png')} style={styles.ctaIconSingleRow} />
    {/* </TouchableOpacity> */}
  </View>
</View>

{/* REVIEW */}
<View style={styles.reviewRow}>
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
<View style={styles.referContainer}>
  <Image source={require('../assets/logo.png')} style={styles.referImage} />
  <Text style={styles.referTitle}>Refer a Friend</Text>
  <Text style={styles.referText}>
    Invite your friends and earn bill credits when they join and help others!
  </Text>
  <TouchableOpacity style={styles.referButton}>
    <Text style={styles.referButtonText}>Invite Now</Text>
  </TouchableOpacity>
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
    width: 380,
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
  
  
  reviewRow: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A7542',
  },
  reviewProfilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewText: {
    fontSize: 14,
    marginVertical: 10,
    color: '#44684B',
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 15,
    marginLeft: 4,
    color: '#4A7C59',
    fontWeight: '600',
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
  
  
});

export default HomeScreen;
