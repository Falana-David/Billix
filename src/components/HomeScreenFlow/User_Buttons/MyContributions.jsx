import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import { useNavigation } from '@react-navigation/native';
import HelpRequestModal from '../../HelpRequestModal';

const MyContributions = () => {
  const { user } = useContext(UserContext);
  const [activeContributions, setActiveContributions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [timers, setTimers] = useState({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentSwapId, setCurrentSwapId] = useState(null);
  const navigation = useNavigation();
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContributions(); // Move fetchContributions outside useEffect
    setRefreshing(false);
  };
  

  const fetchContributions = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/user-swaps', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
  
      const CONTRIBUTOR_STATUSES = ['accepted'];
      const active = res.data.swaps
        .filter((swap) => {
          const isUserA = swap.user_a_id === user.id;
          const isUserB = swap.user_b_id === user.id;
          const isRelevantStatus = CONTRIBUTOR_STATUSES.includes(swap.status);
          const userUploadedProof = swap.proof_uploaded_by === user.id;
          return (isUserA || isUserB) && isRelevantStatus && !userUploadedProof;
        })
        .map((swap) => {
          const isUserA = swap.user_a_id === user.id;
          return {
            ...swap,
            youOwe: isUserA ? swap.user2_bill_amount : swap.user1_bill_amount,
            partnerId: isUserA ? swap.user_b_id : swap.user_a_id,
            billixDueDate: isUserA ? swap.billix_due_date_user_a : swap.billix_due_date_user_b,
          };
        });
  
      setActiveContributions(active);
  
      const countdowns = {};
      active.forEach((swap) => {
        if (swap.billix_due_date) {
          const dueDate = new Date(swap.billix_due_date);
          countdowns[swap.id] = calculateCountdown(dueDate);
        }
      });
      setTimers(countdowns);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load contributions.');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchContributions();
    }
  }, [user]);
  
  

  const calculateCountdown = (dueDate) => {
    const now = new Date();
    const diff = dueDate - now;
    if (diff <= 0) return 'Past due';
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m remaining`;
  };

  const handleUpload = async (swapId) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      const file = res[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
      formData.append('swap_id', swapId);

      await axios.post('http://127.0.0.1:5000/upload-proof', formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const billixDue = new Date(activeContributions.find(s => s.id === swapId)?.billix_due_date);
      const now = new Date();
        if (billixDue && now > billixDue) {
        Alert.alert("Too Late", "The Billix due date has passed. This swap may be declined.");
        return;
      }


      setUploadedFiles((prev) => ({ ...prev, [swapId]: file.name }));
      setActiveContributions((prev) => prev.filter((s) => s.id !== swapId));
      Alert.alert('Success', 'Proof of payment uploaded. Swap is now awaiting confirmation.');      
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
        Alert.alert('Upload Failed', 'Something went wrong.');
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F8EC' }}> 
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
      overScrollMode="always" // Ensures drag works on Android
    >
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Bills You’re Covering</Text>


      {activeContributions.length === 0 ? (
        <Text style={styles.noSwaps}>You haven’t agreed to cover any bills yet.</Text>
      ) : (
        activeContributions.map((swap) => (
          <View key={swap.id} style={styles.card}>
            <Text style={styles.swapId}>Swap ID: {swap.id}</Text>
            <Text style={styles.amount}>
              You Owe Them: ${swap.youOwe?.toFixed(2)}
            </Text>

            <Text style={styles.status}>STATUS: {swap.status.toUpperCase()}</Text>
            <Text style={styles.billixDue}>Billix Due Date: {swap.billix_due_date?.slice(0, 10)}</Text>
            <Text style={styles.countdown}>{timers[swap.id]}</Text>

            <Text style={styles.reminder}>
              You agreed to cover your partner’s bill. Upload proof after payment.
            </Text>

            <View style={styles.instructions}>
              <Text style={styles.instructionHeader}>How to Pay:</Text>
              <Text style={styles.instructionText}>Use one of these methods:</Text>
              <Text style={styles.instructionBullet}>• Guest payment portal on billing website</Text>
              <Text style={styles.instructionBullet}>• Coordinate the payment method privately through your chat partner.</Text>

            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload(swap.id)}>
              <Text style={styles.uploadText}>
                {uploadedFiles[swap.id] ? `✓ ${uploadedFiles[swap.id]}` : 'Upload Proof of Payment'}
              </Text>
            </TouchableOpacity>
            {uploadedFiles[swap.id] && (
                <Text style={{ fontSize: 12, color: '#4A7C59', textAlign: 'center', marginBottom: 8 }}>
                    Uploaded: {uploadedFiles[swap.id]}
                </Text>
            )}
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('ChatScreen', {
                swapId: swap.id,
                partnerId: swap.user_a_id
              })}
            >
              <Text style={styles.chatText}>Chat With Partner</Text>
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

            {swap.status === 'proof_submitted' ? (
            <Text style={styles.waitingNote}>Proof submitted. Waiting for confirmation.</Text>
            ) : (
            <Text style={styles.waitingNote}>Awaiting confirmation from your partner once paid.</Text>
            )}

          </View>
        ))
        
      )}
        <HelpRequestModal
          visible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          swapId={currentSwapId}
        />
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    // backgroundColor: '#F0F8EC',
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
  status: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 13,
    color: '#A05C2D',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 13,
    color: '#B00020',
    marginBottom: 10,
    fontWeight: '600',
  },
  reminder: {
    fontSize: 13,
    color: '#B00020',
    fontWeight: '600',
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
    marginBottom: 6,
  },
  instructionBullet: {
    fontSize: 13,
    color: '#333',
    marginLeft: 10,
    marginBottom: 4,
  },
  uploadBtn: {
    backgroundColor: '#4A7C59',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadText: {
    color: '#fff',
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
  waitingNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  helpBtn: {
    backgroundColor: '#FFEFCC',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  helpText: {
    color: '#A05C2D',
    fontWeight: '600',
  },
  billixDue: {
    fontSize: 13,
    color: '#C62828',
    marginBottom: 6,
    fontWeight: '700',
  },  
  
});

export default MyContributions;
