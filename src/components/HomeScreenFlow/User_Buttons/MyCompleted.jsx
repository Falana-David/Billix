import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
  Platform,
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import { useNavigation } from '@react-navigation/native';
import Collapsible from 'react-native-collapsible';

const MyCompleted = () => {
  const { user } = useContext(UserContext);
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchCompleted = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/user-swaps', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const completed = res.data.swaps.filter(
        swap =>
          ['proof_submitted', 'confirmed', 'completed'].includes(swap.status) &&
          (swap.user_a_id === user?.id || swap.user_b_id === user?.id)
      );

      setCompletedSwaps(completed);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load completed swaps.');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchCompleted();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompleted();
    setRefreshing(false);
  };

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Your Completed Swaps</Text>

        {completedSwaps.length === 0 ? (
          <Text style={styles.noSwaps}>You haven't completed any swaps yet.</Text>
        ) : (
          completedSwaps.map((swap, index) => {
            const isOpen = expandedIndex === index;
            return (
              <View key={swap.id} style={styles.card}>
                <TouchableOpacity
                  onPress={() => toggleExpand(index)}
                  style={styles.cardHeader}
                >
                  <Text style={styles.cardTitle}>Swap #{swap.id}</Text>
                  <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                <Collapsible collapsed={!isOpen}>
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Your Role:</Text>
                      <Text style={styles.infoValue}>{swap.role}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>You Paid:</Text>
                      <Text style={styles.infoValue}>${swap.user1_bill_amount?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Bill Type:</Text>
                      <Text style={styles.infoValue}>{swap.user1_bill_type}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Due Date:</Text>
                      <Text style={styles.infoValue}>{swap.user1_bill_due_date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Billix Due Date:</Text>
                      <Text style={styles.infoValue}>{swap.billix_due_date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <Text style={styles.infoValue}>{swap.status.replace('_', ' ')}</Text>
                    </View>

                    {swap.proof_file_url && (
                      <TouchableOpacity onPress={() => Linking.openURL(swap.proof_file_url)}>
                        <Text style={styles.linkText}>View Uploaded Proof</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Collapsible>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5FDF6', // Prevents gray flash on pull
  },
  container: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D4F45',
    textTransform: 'capitalize',
  },
  arrow: {
    fontSize: 18,
    color: '#4CAF50',
  },
  cardBody: {
    marginTop: 12,
    backgroundColor: '#F7FCF9',
    borderRadius: 10,
    padding: 12,
  },
  infoRow: {
    marginBottom: 6,
  },
  infoLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  infoValue: {
    color: '#2F5D4A',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  linkText: {
    color: '#007BFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});

export default MyCompleted;
