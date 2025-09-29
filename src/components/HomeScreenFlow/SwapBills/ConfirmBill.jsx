import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../../UserContext';

const ConfirmBill = () => {
  const { user } = useContext(UserContext);
  const token = user?.token;
  const navigation = useNavigation();
  const route = useRoute();
  const { fileUri, billType } = route.params;

  const [fields, setFields] = useState({
    amount_due: '',
    due_date: '',
    service_provider_name: '',
    bill_type: billType || '',
    insight: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [feeIndex, setFeeIndex] = useState(0);



  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  const getThreatStyle = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return { backgroundColor: '#E8F5E9', borderLeftColor: '#4CAF50' };
      case 'medium':
        return { backgroundColor: '#FFF8E1', borderLeftColor: '#FFC107' };
      case 'high':
      default:
        return { backgroundColor: '#FEECEC', borderLeftColor: '#D9534F' };
    }
  };
  
  useEffect(() => {
    const uploadAndExtract = async () => {
      try {
        const formData = new FormData();
        const ext = fileUri.split('.').pop();
        const isPdf = ext.toLowerCase() === 'pdf';

        formData.append('file', {
          uri: fileUri,
          name: `bill.${ext}`,
          type: isPdf ? 'application/pdf' : 'image/jpeg',
        });

        formData.append('bill_type', billType || '');
        formData.append('amount_due', '');
        formData.append('due_date', '');
        formData.append('service_provider_name', '');

        const res = await axios.post('http://127.0.0.1:5000/upload-bill', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const extracted = res.data.insight || {};
        setFields(prev => ({
          ...prev,
          amount_due: extracted.amount_due || '',
          due_date: extracted.due_date || '',
          service_provider_name: extracted.provider || '',
          bill_type: extracted.bill_type || '',
          insight: extracted
        }));

      } catch (err) {
        console.error('Auto-upload failed', err.response?.data || err);
        setMessage('Auto-extraction failed. Please fill details manually.');
      } finally {
        setLoading(false);
      }
    };

    uploadAndExtract();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/confirm-upload',
        fields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const { bill_id, payee_id, insight } = response.data;

        const fullBill = {
          ...fields,
          id: bill_id,
          swappable_amount: Math.min(parseFloat(fields.amount_due), 50),
          insight,
        };

        navigation.navigate('OptionalPayments', {
          bill: fullBill,
          matchData: { payee_id, swap_id: null },
        });
      } else {
        setMessage(response.data.message || 'Failed to save bill');
      }
    } catch (err) {
      console.error('❌ Confirm upload error:', err.response?.data || err);
      setMessage(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
    <Text style={styles.header}>Confirm Bill Details</Text>

{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4A7C59" />
  </View>
) : (

          <>
            {fields?.insight && (
  <View style={styles.reportContainer}>
    <View style={styles.qualifyNotice}>
  <Text style={styles.qualifyNoticeText}>
    This bill qualifies for personalized Co-Pilot insights and real-time matching.
  </Text>
</View>

    {fields.insight.threat_level && (
      <View style={[styles.threatLevelBox, getThreatStyle(fields.insight.threat_level)]}>
        <Text style={styles.threatLevelText}>{fields.insight.threat_level}</Text>
      </View>
    )}

    <Text style={styles.reportHeader}>Free Instant Bill Insight Report</Text>

    {/* Page 0 - Bill Summary */}
    {currentPage === 0 && (
      <View style={[styles.reportSection, styles.sectionComparison]}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <Text style={styles.sectionItem}>Provider: {fields.insight.provider || '—'}</Text>
        <Text style={styles.sectionItem}>Bill Type: {capitalize(fields.insight.bill_type)}</Text>
        <Text style={styles.sectionItem}>Amount Due: {fields.insight.amount_due || '—'}</Text>
        <Text style={styles.sectionItem}>Due Date: {fields.insight.due_date || '—'}</Text>
      </View>
    )}

    {/* Page 1 - Regional Comparison */}
    {currentPage === 1 && (
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>Your Bill vs Regional Norms</Text>
        <Text style={styles.sectionItem}>Status: {capitalize(fields.insight.regional_comparison)}</Text>
        <Text style={styles.sectionItem}>{fields.insight.explanation || '—'}</Text>
      </View>
    )}

    {/* Page 2 - Detected Charges */}
    {currentPage === 2 && fields.insight.fees?.length > 0 && (
  <View style={styles.reportSection}>
    <Text style={styles.sectionTitle}>Detected Charges Worth Reviewing</Text>

    {/* Single Fee Card */}
    <View style={styles.feeRow}>
      <Text style={styles.feeTitle}>
        {fields.insight.fees[feeIndex]?.fee_name || '—'}
      </Text>
      <Text style={styles.feeAmount}>
        ${fields.insight.fees[feeIndex]?.amount || '—'}
      </Text>
      <Text style={styles.feeNote}>
        {fields.insight.fees[feeIndex]?.note || ''}
      </Text>
    </View>

    {/* Pagination Controls */}
    <View style={styles.feeCarouselControls}>
  <TouchableOpacity
    disabled={feeIndex === 0}
    onPress={() => setFeeIndex(feeIndex - 1)}
    style={styles.arrowBtn}
  >
    <Text style={[styles.arrowText, feeIndex === 0 && styles.arrowDisabled]}>{'‹'}</Text>
  </TouchableOpacity>

  <View style={styles.dotsContainer}>
    {fields.insight.fees.map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          { backgroundColor: i === feeIndex ? '#2F855A' : '#CBD5E0' },
        ]}
      />
    ))}
  </View>

  <TouchableOpacity
    disabled={feeIndex === fields.insight.fees.length - 1}
    onPress={() => setFeeIndex(feeIndex + 1)}
    style={styles.arrowBtn}
  >
    <Text
      style={[
        styles.arrowText,
        feeIndex === fields.insight.fees.length - 1 && styles.arrowDisabled,
      ]}
    >
      {'›'}
    </Text>
  </TouchableOpacity>
</View>

  </View>
)}


    {/* Page 3 - Suggested Actions */}
    {currentPage === 3 && fields.insight.action_plan?.length > 0 && (
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>Suggested Actions</Text>
        {fields.insight.action_plan.map((tip, idx) => (
          <Text key={idx} style={styles.sectionItem}>• {tip}</Text>
        ))}
      </View>
    )}

    {/* Pagination Controls */}
    <View style={styles.pagination}>
      {currentPage > 0 && (
        <TouchableOpacity onPress={() => setCurrentPage(prev => prev - 1)} style={styles.pageBtn}>
          <Text style={styles.pageBtnText}>Previous</Text>
        </TouchableOpacity>
      )}
      {currentPage < 3 && (
        <TouchableOpacity onPress={() => setCurrentPage(prev => prev + 1)} style={styles.pageBtn}>
          <Text style={styles.pageBtnText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.pageLabel}>
  {['Bill Summary', 'Regional Norms', 'Charges', 'Suggested Actions'][currentPage]}
</Text>
  </View>
)}


<TouchableOpacity
  style={styles.submitBtn}
  onPress={() => {
    // Navigate to OptionalPayments screen with parsed bill and insight
    navigation.navigate('OptionalPayments', {
      bill: {
        amount_due: fields.amount_due,
        due_date: fields.due_date,
        provider_name: fields.service_provider_name,
        bill_type: fields.bill_type || 'Unknown',
        swappable_amount: Math.min(parseFloat(fields.amount_due), 50), // cap for swap
      },
    });
  }}
  disabled={!token || !fields.amount_due || !fields.due_date || !fields.service_provider_name || saving}
>
  {saving ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.submitBtnText}>Looks Good — Continue</Text>
  )}
</TouchableOpacity>


            {message ? <Text style={styles.message}>{message}</Text> : null}
          </>
        )}
      </ScrollView>

      {confirmVisible && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalHeader}> Final Check</Text>
              <Text style={styles.modalText}><Text style={styles.bold}>Amount Due:</Text> Confirm the total amount.</Text>
              <Text style={styles.modalText}><Text style={styles.bold}>Due Date:</Text> Is the deadline correct?</Text>
              <Text style={styles.modalText}><Text style={styles.bold}>Provider:</Text> Double check who sent this bill.</Text>
              <Text style={styles.modalText}><Text style={styles.bold}>Bill Type:</Text> Rent, Utilities, etc.</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setConfirmVisible(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setConfirmVisible(false); handleSave(); }} style={styles.confirmBtn}>
                  <Text style={styles.confirmText}>Yes, Help Me Share This Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    </SafeAreaView>

  );
};


const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  pageBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
    paddingBottom: 80,
  },
  
  
  
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2F855A',
    marginBottom: 12, // reduced for visual balance
  },
  
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F855A',
    marginBottom: 10,
  },
  summaryItem: {
    fontSize: 15,
    color: '#2D3748',
    marginBottom: 6,
  },
  swapNotice: {
    backgroundColor: '#E6FFFA',
    borderLeftWidth: 4,
    borderLeftColor: '#38B2AC',
    padding: 12,
    marginBottom: 20,
    fontSize: 13,
    color: '#234E52',
    borderRadius: 8,
    width: '100%',
  },
  reportContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  reportSection: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionSummary: {
    backgroundColor: '#EDF2F7',
    borderLeftColor: '#CBD5E0',
  },
  sectionComparison: {
    backgroundColor: '#FFFAE5',
    borderLeftColor: '#ECC94B',
  },
  sectionCharges: {
    backgroundColor: '#E6F6FF',
    borderLeftColor: '#63B3ED',
  },
  sectionActions: {
    backgroundColor: '#E6FFED',
    borderLeftColor: '#48BB78',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2D3748',
  },
  sectionItem: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 6,
  },
  feeRow: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,  // slight space between card and controls
  },
  
  feeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
  },
  feeAmount: {
    fontSize: 14,
    color: '#2B6CB0',
    marginBottom: 2,
  },
  feeNote: {
    fontSize: 13,
    color: '#718096',
  },
  threatLevelBox: {
    backgroundColor: '#FFF5F5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  threatLevelText: {
    color: '#C53030',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  pageBtn: {
    padding: 12,
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  pageBtnText: {
    fontWeight: '600',
    color: '#2B6CB0',
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
    marginTop: 6,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#2F855A',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    marginTop: 12,
    color: '#C53030',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2F855A',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#1A202C',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelBtn: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#2B6CB0',
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#2F855A',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
  feeCarouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,       // was 14 — reduced space above dots
    marginBottom: 1,    // added for tightness
    // paddingVertical: 4, // gives a soft visual boundary
  },
  
  
  arrowBtn: {
    padding: 10,
  },
  
  arrowText: {
    fontSize: 26,       // was 22 — easier to tap
    color: '#2F855A',
    fontWeight: '800',  // more presence
  },
  
  
  arrowDisabled: {
    color: '#A0AEC0',
  },
  
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  qualifyNotice: {
    backgroundColor: '#E6FFFA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 4, // 👈 new line
    borderLeftWidth: 4,
    borderLeftColor: '#38B2AC',
  },
  
  
  qualifyNoticeText: {
    color: '#234E52',
    fontSize: 13,
    lineHeight: 18,
  },
  
  
});


export default ConfirmBill;
