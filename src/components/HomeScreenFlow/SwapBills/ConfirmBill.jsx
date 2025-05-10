import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView, Platform
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../UserContext'; // Adjust path as needed

import axios from 'axios';

const ConfirmBill = () => {
  const { user } = useContext(UserContext);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const token = user?.token;    
  const navigation = useNavigation();
  const route = useRoute();
  const { fileUri, billType } = route.params;

  const [fields, setFields] = useState({
    amount_due: '',
    due_date: '',
    service_provider_name: '',
    account_number: '',
    bill_type: billType || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
        const uploadAndExtract = async () => {
          try {
            const formData = new FormData();
            const ext = fileUri.split('.').pop();
            const isPdf = ext.toLowerCase() === 'pdf';
            const today = new Date();
            const twoWeeksFromNow = new Date(today.setDate(today.getDate() + 14));
            // const defaultDueDate = twoWeeksFromNow.toLocaleDateString('en-US'); // MM/DD/YYYY
            // console.log(defaultDueDate)

      
            formData.append('file', {
              uri: fileUri,
              name: `bill.${ext}`,
              type: isPdf ? 'application/pdf' : 'image/jpeg',
            });
      
            // Add placeholder field data to satisfy backend expectations
            formData.append('bill_type', billType || '');
            formData.append('amount_due', '');
            formData.append('due_date', '');
            formData.append('service_provider_name', '');
            formData.append('account_number', '');
      
            const res = await axios.post('http://127.0.0.1:5000/upload-bill', formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            });
      
            const extracted = res.data.data;
            setFields({
                amount_due: extracted.amount_due || '',
                due_date: extracted.due_date
                  ? new Date(extracted.due_date).toLocaleDateString('en-US')
                  : '',
                service_provider_name: extracted.service_provider_name || '',
                account_number: extracted.account_number || '',
                bill_type: extracted.bill_type || '',
                urgent: extracted.urgent || '',
              });
              
      
          } catch (err) {
            console.error('Auto-upload failed', err.response?.data || err);
            setMessage('Auto-extraction failed. Please fill details manually.');
          } finally {
            setLoading(false);
          }
        };
      
        uploadAndExtract();
      }, []);
      
      

      const handleChange = (field, value) => {
        if (field === 'due_date') {
          // Remove all non-digits
          let cleaned = value.replace(/\D/g, '');
      
          if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
      
          let formatted = cleaned;
          if (cleaned.length >= 5) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
          } else if (cleaned.length >= 3) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
          }
      
          setFields(prev => ({ ...prev, [field]: formatted }));
        } else {
          setFields(prev => ({ ...prev, [field]: value }));
        }
      };
      

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
        const { bill_id, payee_id } = response.data;

        const fullBill = {
            ...fields,
            id: bill_id,
            swappable_amount: Math.min(parseFloat(fields.amount_due), 50),
          };
        console.log('🧾 Confirm Upload Response:', response.data);

        setMessage(response.data.message || 'Bill saved successfully!');
        navigation.navigate('OptionalPayments', { bill: fullBill, matchData: { payee_id, swap_id: null, } });
        console.log("✅ Passing bill to OptionalPayments:", fullBill);

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
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Confirm Bill Details</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4A7C59" />
      ) : (
        <View style={{ width: '100%' }}>
          {['amount_due', 'due_date', 'service_provider_name', 'account_number', 'bill_type'].map(
            key => (
              <TextInput
                key={key}
                placeholder={key.replace(/_/g, ' ').toUpperCase()}
                style={styles.input}
                value={fields[key]}
                onChangeText={text => handleChange(key, text)}
              />
            )
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => setConfirmVisible(true)}
            disabled={
              saving ||
              !token ||
              !fields.amount_due ||
              !fields.due_date ||
              !fields.service_provider_name ||
              !fields.account_number
            }
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Confirm & Save</Text>
            )}
          </TouchableOpacity>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      )}
    </ScrollView>

    {/* 🔒 Confirmation Modal */}
    {confirmVisible && (
      <Modal visible transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>📝 Final Check</Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Amount Due:</Text> What’s the total amount you owe on this bill?
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Due Date:</Text> When is it due? (Use MM/DD/YYYY)
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Service Provider:</Text> Who sent this bill? (e.g., Comcast, Blue Cross)
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Account #:</Text> The reference or account number found on the bill.
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Bill Type:</Text> Select Rent, Utilities, Phone, etc.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisible(false);
                  handleSave();
                }}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmText}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )}
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F8EC',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: '#4A7C59',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    marginTop: 12,
    color: '#d9534f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F0F8EC',
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#2F5D4A',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#1C3D2E',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#EAF2E7',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#4A7C59',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#4A7C59',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  
});

export default ConfirmBill;
