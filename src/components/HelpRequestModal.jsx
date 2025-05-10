import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { UserContext } from './UserContext';
import axios from 'axios';

const HelpRequestModal = ({ visible, onClose, swapId }) => {
  const { user } = useContext(UserContext);

  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const commonIssues = [
    "My partner hasn’t responded",
    "The proof of payment looks fake",
    "I uploaded proof but it’s not confirming",
    "I want to cancel this swap",
  ];

  const handleSubmit = async () => {
    if (!issueType) {
      Alert.alert('Missing Info', 'Please select or enter an issue type.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://127.0.0.1:5000/submit-help-request',
        {
          swap_id: swapId,
          issue_type: issueType,
          message,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      Alert.alert('Submitted', 'Your request has been sent to Billix moderators.');
      setIssueType('');
      setMessage('');
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Need Help from Billix?</Text>

          <Text style={styles.label}>Select an Issue:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.issueScroll}>
            {commonIssues.map((issue, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.issueChip,
                  issueType === issue && styles.selectedChip,
                ]}
                onPress={() => setIssueType(issue)}
              >
                <Text style={styles.issueText}>{issue}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Optional Message:</Text>
          <TextInput
            multiline
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Explain your issue (optional)..."
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1A4D72',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  issueScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  issueChip: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#D0ECFF',
  },
  issueText: {
    color: '#333',
    fontSize: 13,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A05C2D',
    marginRight: 10,
  },
  
  cancelText: {
    color: '#A05C2D',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  submitBtn: {
    backgroundColor: '#1A4D72',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HelpRequestModal;
