import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import Collapsible from 'react-native-collapsible';
import { useNavigation } from '@react-navigation/native';

const MyCompleted = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [insights, setInsights] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/free-insights', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setInsights(res.data?.insights || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.token) fetchInsights();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5FDF6' }}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Your Free Insight Reports</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
      >
        {insights.length === 0 ? (
          <Text style={styles.empty}>No insights found yet.</Text>
        ) : (
          insights.map((insight, index) => {
            const open = index === expandedIndex;
            return (
              <View key={insight.id || index} style={styles.card}>
                <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {insight.provider || 'Unknown Provider'} – {insight.bill_type}
                  </Text>
                  <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                <Collapsible collapsed={!open}>
                  <View style={styles.detailBox}>
                    <Text style={styles.label}>Due Date:</Text>
                    <Text style={styles.text}>{insight.due_date || '—'}</Text>

                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.text}>{insight.status || '—'}</Text>

                    <Text style={styles.label}>Explanation:</Text>
                    <Text style={styles.text}>{insight.explanation || '—'}</Text>

                    <Text style={styles.label}>Action Plan:</Text>
                    {(insight.action_plan || []).map((step, i) => (
                      <Text key={i} style={styles.bullet}>• {step}</Text>
                    ))}

                    {insight.fees?.length > 0 && (
                      <>
                        <Text style={styles.label}>Flagged Charges:</Text>
                        {insight.fees.map((fee, i) => (
                          <View key={i} style={styles.feeRow}>
                            <Text style={styles.feeTitle}>{fee.fee_name || '—'}:</Text>
                            <Text style={styles.feeAmount}>${fee.amount || '—'}</Text>
                            <Text style={styles.feeNote}>{fee.note || ''}</Text>
                          </View>
                        ))}
                      </>
                    )}

                    {insight.community_tip && (
                      <>
                        <Text style={styles.label}>Community Tip:</Text>
                        <Text style={styles.text}>{insight.community_tip}</Text>
                      </>
                    )}

                    {insight.billix_fairness_insight && (
                      <>
                        <Text style={styles.label}>Billix Fairness Insight:</Text>
                        <Text style={styles.text}>{insight.billix_fairness_insight}</Text>
                      </>
                    )}
                  </View>
                </Collapsible>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F5FDF6',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  backText: {
    fontSize: 16,
    color: '#1A4D72',
    fontWeight: '600',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D72',
    textAlign: 'center',
  },
  container: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C3D2E',
  },
  arrow: {
    fontSize: 18,
    color: '#4CAF50',
  },
  detailBox: {
    marginTop: 12,
    backgroundColor: '#F0F8F2',
    borderRadius: 10,
    padding: 12,
  },
  label: {
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 10,
  },
  text: {
    color: '#333',
    marginTop: 2,
  },
  bullet: {
    color: '#444',
    marginTop: 4,
    marginLeft: 6,
  },
  feeRow: {
    marginTop: 6,
  },
  feeTitle: {
    fontWeight: '600',
    color: '#000',
  },
  feeAmount: {
    color: '#2E7D32',
  },
  feeNote: {
    fontSize: 13,
    color: '#666',
  },
});

export default MyCompleted;
