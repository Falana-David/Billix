import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { UserContext } from './UserContext'; // Assuming UserProvider is in the same directory

const HomeScreen = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useContext(UserContext); // Get the user data from context

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleImagePress = (imageName) => {
    console.log(`${imageName} image pressed`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={user?.profilePicture ? { uri: user.profilePicture } : require('./assets/logo.png')}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{getGreeting()}, {user?.firstName || 'Ronald Richards'}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        <View style={styles.ratingContainer}>
          {/* Star Rating inside a card */}
          <View style={styles.starCard}>
            <Text style={styles.ratingText}>4.5</Text>
            <Image source={require('./assets/star.png')} style={styles.starIcon} />
          </View>
        </View>
      </View>

      {/* Collapsible Section */}
      <TouchableOpacity onPress={toggleCollapse} style={styles.collapsibleHeader}>
        <Text style={styles.collapsibleText}>Bill Activity</Text>
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed}>
        <View style={styles.collapsibleContent}>
          {/* Pending */}
          <TouchableOpacity onPress={() => handleImagePress('Pending')}>
            <View style={styles.pendingContainer}>
              <Image
                source={require('./assets/pending.png')}
                style={styles.imagePending}
              />
            </View>
          </TouchableOpacity>

          {/* Completed */}
          <TouchableOpacity onPress={() => handleImagePress('Completed')}>
            <View style={styles.completedContainer}>
              <Image
                source={require('./assets/completed.png')}
                style={styles.imageCompleted}
              />
            </View>
          </TouchableOpacity>

          {/* Active */}
          <TouchableOpacity onPress={() => handleImagePress('Active')}>
            <View style={styles.activeContainer}>
              <Image
                source={require('./assets/active.png')}
                style={styles.imageActive}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Always Visible Images */}
      <View style={styles.alwaysVisibleImages}>
        <TouchableOpacity onPress={() => handleImagePress('Exchange Bills')}>
          <View style={styles.exchangeBillsContainer}>
            <Image
              source={require('./assets/exchange-bills.png')}
              style={styles.imageExchangeBills}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content Section */}
      <View style={styles.mainContent}>
        {/* Review Section */}
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewHeaderText}>Review</Text>
            <Image source={require('./assets/logo.png')} style={styles.reviewProfilePic} />
          </View>
          <Text style={styles.reviewText}>
            “Great design and super easy to use—managing finances has never been simpler!”
          </Text>
          <View style={styles.reviewFooter}>
            <View style={styles.reviewRating}>
              <Image source={require('./assets/star.png')} style={styles.starIcon} />
              <Text style={styles.reviewRatingText}>4.5</Text>
            </View>
            <View style={styles.reviewNav}>
              <Text style={styles.navArrow}>{"<"}</Text>
              <Text style={styles.navArrow}>{">"}</Text>
            </View>
          </View>
        </View>

        {/* Buttons Section (2x2 Grid Layout, no text below icons) */}
        <View style={styles.buttonsContainer}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleImagePress('Chat')}>
              <View style={styles.buttonCard}>
                <Image source={require('./assets/chat-button-home.png')} style={styles.buttonImage} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleImagePress('Funding')}>
              <View style={styles.buttonCard}>
                <Image source={require('./assets/funding-button-home.png')} style={styles.buttonImage} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleImagePress('FAQ')}>
              <View style={styles.buttonCard}>
                <Image source={require('./assets/faq-button-home.png')} style={styles.buttonImage} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleImagePress('Vote')}>
              <View style={styles.buttonCard}>
                <Image source={require('./assets/voting-button-home.png')} style={styles.buttonImage} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  dateText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  ratingContainer: {
    marginTop: 10,
  },
  starCard: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginRight: 5,
  },
  starIcon: {
    width: 20,
    height: 20,
  },
  collapsibleHeader: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    width: '90%',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 20,
  },
  collapsibleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  collapsibleContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pendingContainer: {
    width: 370,
    height: 168,
    backgroundColor: '#FCF3E8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePending: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  completedContainer: {
    width: 370,
    height: 62,
    backgroundColor: '#F0F8EC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageCompleted: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  activeContainer: {
    width: 370,
    height: 62,
    backgroundColor: '#E8F4FC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageActive: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  alwaysVisibleImages: {
    alignItems: 'center',
    marginTop: 20,
  },
  exchangeBillsContainer: {
    width: 380,
    height: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EAF2E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  imageExchangeBills: {
    width: '120%',
    height: '120%',
    resizeMode: 'contain',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginBottom: 20,
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    width: '50%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewHeaderText: {
    fontSize: 16,
    color: '#4A7C59',
    fontWeight: 'bold',
  },
  reviewProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewText: {
    fontSize: 16,
    color: '#4A7C59',
    marginVertical: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 16,
    marginLeft: 5,
  },
  reviewNav: {
    flexDirection: 'row',
  },
  navArrow: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '43%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
  },
  buttonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonImage: {
    width: 96,
    height: 96,
  },
});

export default HomeScreen;
