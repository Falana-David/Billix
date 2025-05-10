import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import { useNavigation } from '@react-navigation/native';
import HelpRequestModal from '../../HelpRequestModal';

const Active = () => {
  const { user } = useContext(UserContext);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const commonIssues = [
    "My partner hasn’t responded",
    "The proof of payment looks fake",
    "I uploaded proof but it’s not confirming",
    "I want to cancel this swap",
  ];
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentSwapId, setCurrentSwapId] = useState(null);
  

  const fetchActiveSwaps = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/user-swaps', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const ACTIVE_STATUSES = ['matched', 'accepted', 'proof_submitted'];
      const active = res.data.swaps.filter(
        swap =>
          ACTIVE_STATUSES.includes(swap.status) &&
          (swap.user_a_id == user.id || swap.user_b_id == user.id)
      );
      
            setActiveSwaps(active);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load active swaps.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchActiveSwaps();
    }
  }, [user]);
  

  const handleConfirmReceived = (swapId) => {
    Alert.alert(
      'Confirm Bill Paid',
      'Are you confirming that your bill was successfully paid by your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Confirm',
          onPress: async () => {
            try {
              await axios.post('http://127.0.0.1:5000/confirm-received', {
                swap_id: swapId,
              }, {
                headers: {
                  Authorization: `Bearer ${user?.token}`,
                },
              });
              Alert.alert('Confirmed', 'Thanks! Your swap is now completed.');
              setActiveSwaps((prev) => prev.filter(s => s.id !== swapId));
            } catch (err) {
                console.error('Confirm Error:', err.response?.data || err.message);
                const message = err.response?.data?.error || 'Could not confirm receipt.';
                Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E8F4FC' }}> 
    <ScrollView contentContainerStyle={styles.container}
        refreshControl={
            <RefreshControl
      refreshing={refreshing}
      onRefresh={fetchActiveSwaps}
    />
      }>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Help You're Receiving</Text>

      <TouchableOpacity
        style={styles.contributionsBtn}
        onPress={() => navigation.navigate('MyContributions')}
      >
        <Text style={styles.contributionsText}>→ View Bills You’re Covering</Text>
      </TouchableOpacity>

      {activeSwaps.length === 0 ? (
        <Text style={styles.noSwaps}>You have no active swaps at the moment.</Text>
      ) : (
        activeSwaps.map((swap) => (
          <View key={swap.id} style={styles.card}>
            <Text style={styles.swapId}>Swap ID: {swap.id}</Text>
            <Text style={styles.amount}>
              Your Bill Being Covered: $
              {(swap.user_a_id == user.id
                ? swap.user1_bill_amount
                : swap.user2_bill_amount
              )?.toFixed(2)}
            </Text>
            <Text style={styles.dueDate}>
            Your Bill Due: {swap.role === 'contributor' ? swap.user2_bill_due_date?.slice(0, 10) : swap.user1_bill_due_date?.slice(0, 10)}
            </Text>

            <Text style={styles.status}>STATUS: {swap.status.toUpperCase()}</Text>

            <Text style={styles.tip}>
              You’ve requested help. Your partner agreed to cover your bill.
            </Text>

            <View style={styles.instructions}>
              <Text style={styles.instructionHeader}>Next Steps</Text>
              <Text style={styles.instructionText}>• Wait for your partner to pay.</Text>
              <Text style={styles.instructionText}>• Once paid, confirm it here.</Text>
              <Text style={styles.instructionText}>• If payment fails, request help below.</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmReceived(swap.id)}>
              <Text style={styles.confirmText}>Confirm Bill Was Paid</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('ChatScreen', {
                swapId: swap.id,
                partnerId: user.id === swap.user_a_id ? swap.user_b_id : swap.user_a_id
              })}
            >
              <Text style={styles.chatText}> Chat With Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={styles.helpBtn}
  onPress={() => {
    setCurrentSwapId(swap.id);
    setShowHelpModal(true);
  }}
>
  <Text style={styles.helpText}>Need Help from Billix?</Text>
</TouchableOpacity>

            <HelpRequestModal
              visible={showHelpModal}
              onClose={() => setShowHelpModal(false)}
              swapId={currentSwapId}
            />
          </View>
        ))
      )}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#E8F4FC',
    // paddingTop: 50,
    marginTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backBtnText: {
    color: '#1A4D72',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A4D72',
    textAlign: 'center',
    marginBottom: 20,
  },
  noSwaps: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    elevation: 3,
  },
  swapId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7C59',
    marginVertical: 6,
  },
  dueDate: {
    fontSize: 13,
    color: '#A05C2D',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  tip: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  instructions: {
    backgroundColor: '#F1FAFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  instructionHeader: {
    fontWeight: '700',
    color: '#1A4D72',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  confirmBtn: {
    backgroundColor: '#B2E5D0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: '#004C3F',
    fontWeight: '600',
  },
  chatBtn: {
    backgroundColor: '#D0ECFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  chatText: {
    color: '#004C8C',
    fontWeight: '600',
  },
  helpBtn: {
    backgroundColor: '#FFEFCC',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpText: {
    color: '#A05C2D',
    fontWeight: '600',
  },
  contributionsBtn: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#D0ECFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contributionsText: {
    color: '#004C8C',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default Active;
