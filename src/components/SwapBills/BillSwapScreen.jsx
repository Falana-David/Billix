import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput, ActivityIndicator, Image, Modal } from 'react-native';
import Header from '../Header';
import Video from 'react-native-video';

const BillSwapScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState('LandingPage');
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [billDetails, setBillDetails] = useState({
    provider: '',
    amount: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchDistributedAmount = async () => {
      const amount = await new Promise((resolve) => setTimeout(() => resolve(Math.floor(Math.random() * 1000)), 1000));
      setTotalDistributed(amount);
    };

    const animate = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        fetchDistributedAmount();
        animate();
      });
    };

    fetchDistributedAmount();
    animate();
  }, [fadeAnim]);

  const handleInputChange = (name, value) => {
    setBillDetails({ ...billDetails, [name]: value });
  };

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('FindMatches', { billDetails });
    }, 2000); // Simulating a delay for loading
  };

  const renderLandingPage = () => (
    <View style={styles.container}>
      <Header title="BillSwap" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.introSection}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={require('../assets/circle-left-regular.png')} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <Text style={styles.introTitle}>Welcome to BillSwap</Text>
          </View>
          <Text style={styles.introDescription}>
            BillSwap allows you to trade bill payment responsibilities with others who may find it more convenient or beneficial to pay a different type of bill. Save money and make life easier with BillSwap.
          </Text>
          <View style={styles.howItWorks}>
  <Text style={styles.howItWorksTitle}>How It Works</Text>
  <Video
    source={require('../assets/Billix_Final_Animation.mp4')}
    resizeMode="contain"
    repeat
    muted={false}
    controls
    style={styles.video}
  />
</View>

        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('BillSwapSelection')}>
            <Text style={styles.primaryButtonText}>Start Swapping</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.trackerSection, { opacity: fadeAnim }]}>
          <Text style={styles.trackerTitle}>Today's Distribution</Text>
          <Text style={styles.trackerAmount}>${totalDistributed}</Text>
          <Text style={styles.trackerDescription}>
            Total amount distributed to users today through shared profits, rewards, and swap incentives.
          </Text>
        </Animated.View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderBillInformationCollectionPage = () => (
    <View style={styles.container}>
      <Header title="Bill Information" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => setCurrentPage('LandingPage')} style={styles.backButton}>
          <Image source={require('../assets/circle-left-regular.png')} style={styles.backButtonIcon} />
        </TouchableOpacity>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Upload or Scan Bill</Text>
          {/* Replace with your upload/scan component */}
          <View style={styles.uploadPlaceholder}>
            <Text>Upload/Scan Placeholder</Text>
          </View>
          <Text style={styles.sectionTitle}>Verify Bill Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Provider"
            value={billDetails.provider}
            onChangeText={(text) => handleInputChange('provider', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={billDetails.amount}
            onChangeText={(text) => handleInputChange('amount', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date"
            value={billDetails.dueDate}
            onChangeText={(text) => handleInputChange('dueDate', text)}
          />
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const pages = [
    {
      title: 'Introduction to Bill Swapping',
      description: `Bill Swapping is a peer-to-peer platform that allows users to exchange bill payment responsibilities with others. This innovative approach enables users to find flexibility in their payment schedules by trading bills with others who might prefer to pay a different type of bill. By participating in Bill Swapping, users can relieve financial stress and manage their due dates more effectively.`,
    },
    {
      title: 'Core Features of Bill Swapping',
      description: `Bill Swapping offers several unique features:\n\n
- **User Profiles**: Each user has a detailed profile, including bill payment history, preferences, and ratings, to ensure a secure and trustworthy environment.\n\n
- **Bill Listing and Matching**: List your bills with details like amount, due date, and type. Our algorithm suggests potential swaps that match your preferences.\n\n
- **Secure Payment Gateway**: Transactions are handled securely with an escrow service, ensuring funds are protected until swaps are confirmed.\n\n
- **Ratings and Reviews**: Post-swap ratings foster community trust and reliability.\n\n
- **Bill Tracking and Reminders**: Automated notifications ensure timely payments of swapped bills.`,
    },
    {
      title: 'Types of Swaps',
      description: `Explore various swap types to find the best fit for your needs:\n\n
- **Exact Matches**: Swap bills of equal amounts with another user.\n\n
- **Fractional Swaps**: Partially cover each other’s bills.\n\n
- **Multiple Swaps**: Split larger bills across multiple users.\n\n
- **Group Swaps**: Form groups to swap combined bills.\n\n
- **Reverse Swaps**: Reverse a swap if needed, with clear guidelines.\n\n
- **Flexible Payment Swaps**: Negotiate payment terms like installments.\n\n
- **Priority Swaps**: Pay a fee to prioritize your bill listings.`,
    },
    {
      title: 'Emphasis on Profit Sharing',
      description: `At Billix, we prioritize community and shared success:\n\n
- **Shared Profits**: Unlike many platforms, we redistribute a significant portion of our profits to users, ensuring everyone benefits from our success.\n\n
- **User Rewards**: Earn rewards for consistent bill uploads, successful swaps, and active participation. Redeem these rewards for discounts and perks within the app.\n\n
- **Benefiting Users**: Users who accept swaps receive not only the original swapped amount but also a portion of the transaction fee, rewarding their participation.\n\n
- **Transparency and Trust**: We maintain transparency in our operations, providing regular updates on profit sharing and community benefits.`,
    },
  ];

  const renderPageContent = () => {
    const page = pages[currentPageIndex];
    return (
      <View>
        <Text style={styles.modalTitle}>{page.title}</Text>
        <Text style={styles.modalText}>{page.description}</Text>
      </View>
    );
  };

  const renderLearnMoreModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <ScrollView>{renderPageContent()}</ScrollView>
          <View style={styles.paginationButtons}>
            {currentPageIndex > 0 && (
              <TouchableOpacity onPress={() => setCurrentPageIndex(currentPageIndex - 1)}>
                <Text style={styles.paginationButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {currentPageIndex < pages.length - 1 && (
              <TouchableOpacity onPress={() => setCurrentPageIndex(currentPageIndex + 1)}>
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {currentPage === 'LandingPage' && renderLandingPage()}
      {currentPage === 'BillInformationCollectionPage' && renderBillInformationCollectionPage()}
      {renderLearnMoreModal()}
      {/* Add more conditional renderings for other pages as needed */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    marginTop: -10,
    marginLeft: -10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    tintColor: '#4A7C59', // Match the green color scheme
  },
  scrollContainer: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
    flex: 1,
  },
  introDescription: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  howItWorks: {
    marginBottom: 20,
    alignItems: 'center', // Center align the content
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  videoPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '100%', // Make placeholder full width
  },
  trackerSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  trackerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  trackerAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  trackerDescription: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  uploadPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%', // Make placeholder full width
  },
  input: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  modalText: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'left',
    lineHeight: 24, // Increases the line height for better readability
    marginBottom: 10, // Adds space between paragraphs
  },
  
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20, // Adds bottom margin to space out from the text
  },
  
  paginationButtonText: {
    color: '#4A7C59',
    fontWeight: 'bold',
    fontSize: 16, // Ensures the button text is large enough to be easily tappable
  },
  
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 5, // Gives some space at the top for easier access
  },
  
  closeButtonText: {
    color: '#4A7C59',
    fontWeight: 'bold',
    fontSize: 16, // Matches the pagination button text size
  },  

  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  }
  
});

export default BillSwapScreen;
