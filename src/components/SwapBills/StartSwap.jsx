import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

const billTypes = [
  { label: 'Rent/Mortgage', value: 'rent' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Phone/Internet', value: 'phone' },
  { label: 'Medical', value: 'medical' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'Streaming', value: 'streaming' },
];

const StartSwap = () => {
  const navigation = useNavigation();
  const [fileName, setFileName] = useState(null);
  const [billType, setBillType] = useState(null);

  const handlePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      setFileName(res[0]?.name);
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        console.log('User cancelled picker');
      } else {
        console.error('Picker Error: ', e);
      }
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Upload Your Bill</Text>
      <Text style={styles.subText}>Rent, phone, electric – any bill works. Let Billix handle the magic.</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handlePick}>
        <Text style={styles.uploadText}>{fileName || '📎 Tap to upload (PDF, JPG, PNG)'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Bill Type</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.dropdownText}
        selectedTextStyle={styles.dropdownText}
        data={billTypes}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select Category"
        value={billType}
        onChange={item => setBillType(item.value)}
      />

      <View style={styles.tipsBox}>
        <Text style={styles.tip}>• Bill total and due date must be visible</Text>
        <Text style={styles.tip}>• Autopay bills are fine</Text>
        <Text style={styles.tip}>• Summary pages are accepted</Text>
      </View>

      <View style={styles.securityBox}>
        <Text style={styles.securityText}>🔐 Your info is encrypted. Billix never shares your bill data.</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F8EC',
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A7C59',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4A7C59',
    marginBottom: 20,
  },
  uploadBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4A7C59',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    color: '#2F5D4A',
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A7C59',
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#E3F2E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 48,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#2F5D4A',
  },
  tipsBox: {
    backgroundColor: '#EAF2E7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  tip: {
    fontSize: 14,
    color: '#4A7C59',
    marginBottom: 4,
  },
  securityBox: {
    backgroundColor: '#DFF5E1',
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: '#2F5D4A',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E3F2E9',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2F5D4A',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4A7C59',
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default StartSwap;