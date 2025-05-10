import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { useContext } from 'react';
import { UserContext } from '../UserContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

const stateOptions = [
  { label: 'All States', value: '' },
  { label: 'California', value: 'California' },
  { label: 'Illinois', value: 'Illinois' },
  { label: 'New York', value: 'New York' },
];


const FlipCard = ({ bill, setBills }) => {
    const [flipped, setFlipped] = useState(false);
    const [showTrustModal, setShowTrustModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [randomAmount] = useState(() => bill.display_price ?? 3.99);

    const navigation = useNavigation();

    
    // const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { user } = useContext(UserContext);
    const authToken = user?.token;

  
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
    console.log('Auth Token:', authToken);

    const handlePayPress = async () => {
      setLoading(true);
      const amountInCents = Math.round(randomAmount * 100);
    
      try {
        const token = await AsyncStorage.getItem('token');
    
        const response = await fetch('http://127.0.0.1:5000/payment-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amountInCents,
            payee_id: bill.payee_id,  // Ensure this exists on the bill
            swap_id: bill.swap_id,    // Ensure this exists on the bill
            add_ons: {},              // Optional
          }),
        });
        console.log("💡 Bill Data:", bill);
        console.log("💰 Random Amount:", randomAmount);
        console.log("👤 Payee ID:", bill.payee_id);
        console.log("🔁 Swap ID:", bill.swap_id);
        
        if (!response.ok) {
          const error = await response.json();
          Alert.alert('Payment Error', error?.error || 'Could not load payment sheet.');
          return;
        }
    
        const { paymentIntent, ephemeralKey, customer } = await response.json();
    
        const { error: initError } = await initPaymentSheet({
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          paymentIntentClientSecret: paymentIntent,
          merchantDisplayName: 'Billix',
          returnURL: 'billix://home',
        });
    
        if (initError) {
          Alert.alert('Stripe Init Error', initError.message || 'Could not initialize.');
          return;
        }
    
        const { error: presentError } = await presentPaymentSheet();
    
        if (presentError) {
          Alert.alert('Payment Cancelled', presentError.message || 'Canceled.');
        } else {
          Alert.alert('Payment successful!');
          navigation.navigate('Wheels');


        }
      } catch (error) {
        Alert.alert('Unexpected Error', error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
  
    return (
      <TouchableOpacity onPress={handleFlip} activeOpacity={1}>
        <View style={styles.cardWrapper}>
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
              flipped && styles.hidden,
            ]}
          >
            <View style={styles.topRow}>
            <Image
  source={
    typeof bill.profilePicture === 'number'
      ? bill.profilePicture  // from require()
      : { uri: bill.profilePicture } // from API
  }
  style={styles.profileImageLarge}
/>

              <View style={styles.userDetails}>
                <Text style={styles.user}>{bill.user}</Text>
                <Text style={styles.state}>{bill.state}</Text>
              </View>
              <Text style={styles.icon}>{bill.icon}</Text>
            </View>
  
            <View style={styles.cardContent}>
              <Text style={styles.amount}>${randomAmount.toFixed(2)}</Text>
              <Text style={styles.type}>{bill.type}</Text>
              <Text style={styles.date}>{bill.date}</Text>
              <Text style={styles.description}>{bill.description}</Text>
              <Text style={styles.reward}>{bill.reward}</Text>
              <TouchableOpacity onPress={() => setShowTrustModal(true)}>
                <Text style={styles.trustGain}>{bill.trustGain}</Text>
              </TouchableOpacity>
  
              
            </View>
          </Animated.View>
  
          <Animated.View
  style={[
    styles.card,
    styles.cardBack,
    { transform: [{ rotateY: backInterpolate }] },
    !flipped && styles.hidden,
  ]}
>
  <Text style={styles.reason}>{bill.reason}</Text>

  <Text style={styles.amount}>Amount: ${randomAmount.toFixed(2)}</Text>

  <TouchableOpacity
    style={styles.payButton}
    onPress={handlePayPress}
    disabled={loading}
  >
    <Text style={styles.payButtonText}>
      {loading ? 'Processing...' : 'Pay Now'}
    </Text>
  </TouchableOpacity>
</Animated.View>

  
          <Modal
            animationType="slide"
            transparent={true}
            visible={showTrustModal}
            onRequestClose={() => setShowTrustModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalHeader}>Trust Score Boost</Text>
                <Text style={styles.modalText}>
                  Supporting this bill will increase your Trust Score from 2.8 to{' '}
                  {parseFloat(2.8 + parseFloat(bill.trustGain)).toFixed(1)}.
                </Text>
                <TouchableOpacity onPress={() => setShowTrustModal(false)}>
                  <Text style={styles.modalClose}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableOpacity>
    );
  };
  

const StarterBills = () => {
  const navigation = useNavigation();
  const [selectedState, setSelectedState] = useState('');
  const [bills, setBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/public-bills', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      const billsWithPrice = (json.bills || []).map(bill => ({
        ...bill,
        display_price: bill.amount ?? 3.99,  // Use amount if it's coming from backend
      }));
      setBills(billsWithPrice);
      
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };
  const filteredBills = selectedState
  ? bills.filter(b => b.state === selectedState)
  : bills;



  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Pick a Bill to Support</Text>

      <View style={styles.bannerBox}>
        <Text style={styles.bannerText}>
          Help someone for just $2–$10 and unlock full access to the app.
        </Text>
      </View>

      <Text style={styles.subHeader}>Helping this week: 127 users</Text>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Sort by:</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Lowest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Newest</Text>
        </TouchableOpacity>
        <Dropdown
          data={stateOptions}
          labelField="label"
          valueField="value"
          placeholder="By State"
          value={selectedState}
          onChange={item => setSelectedState(item.value)}
          style={styles.dropdown}
          itemTextStyle={{ color: '#2F5D4A' }}
          placeholderStyle={{ color: '#4A7C59' }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
{filteredBills.map((bill, index) => (
  <FlipCard key={`bill-${bill.id || index}`} bill={bill} setBills={setBills} />
))}


      </ScrollView>


      <Text style={styles.swipeHint}>← Swipe to explore more bills →</Text>

      <TouchableOpacity style={styles.footerWrapper}>
        <Text style={styles.footerCTA}>
          Can’t help right now? Learn how to unlock without paying.
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#F0F8EC',
      paddingHorizontal: 10,
      paddingTop: 10,
    },
    backContainer: {
      marginBottom: 10,
      marginLeft: 0,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: 'transparent',
      alignSelf: 'flex-start',
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
      marginTop: 10,
      marginBottom: 10,
      color: '#4A7C59',
    },
    subHeader: {
      fontSize: 14,
      color: '#4A7C59',
      textAlign: 'center',
      marginBottom: 10,
    },
    bannerBox: {
      backgroundColor: '#DFF5E1',
      padding: 12,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 10,
    },
    bannerText: {
      fontSize: 14,
      color: '#2E5B3C',
      textAlign: 'center',
      fontWeight: '500',
    },
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    filterLabel: {
      fontSize: 14,
      marginRight: 8,
      color: '#4A7C59',
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#E3F2E9',
      borderRadius: 8,
      marginHorizontal: 4,
      marginVertical: 4,
    },
    filterText: {
      color: '#2F5D4A',
      fontSize: 13,
    },
    dropdown: {
      width: 90,
      height: 32,
      backgroundColor: '#E3F2E9',
      borderRadius: 8,
      paddingHorizontal: 8,
      marginLeft: 8,
      justifyContent: 'center', 
    },
    dropdownWrapper: {
      width: 150,
      marginLeft: 8,
      backgroundColor: '#E3F2E9',
      borderRadius: 8,
      overflow: 'hidden',
    },
    picker: {
      height: 40,
      width: '100%',
      color: '#2F5D4A',
    },
    swipeHint: {
      textAlign: 'center',
      fontSize: 12,
      color: '#888',
      marginTop: 12,
      marginBottom: 6,
    },
    footerWrapper: {
      paddingVertical: 16,
      marginTop: 10,
      marginBottom: 20,
    },
    footerCTA: {
      textAlign: 'center',
      fontSize: 13,
      color: '#4A7C59',
      textDecorationLine: 'underline',
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
    trustGain: {
      fontSize: 13,
      color: '#2F5D4A',
      textDecorationLine: 'underline',
      marginTop: 6,
    },
    reason: {
      fontSize: 16,
      fontStyle: 'italic',
      color: '#4A4A4A',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalBox: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
    },
    modalHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4A7C59',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 14,
      color: '#444',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalClose: {
      fontSize: 14,
      color: '#4A7C59',
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    payButton: {
        marginTop: 14,
        backgroundColor: '#4A7C59',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
      },
      
      payButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
      },
      
  });
  
export default StarterBills;