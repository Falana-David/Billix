import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../UserContext'; // Adjust the path accordingly
import Header from '../Header';
import CheckBox from '@react-native-community/checkbox'; // Import CheckBox

const BillInformationCollection = ({ navigation, route }) => {
  const { user } = useContext(UserContext);
  const [billDetails, setBillDetails] = useState({
    provider: '',
    amount: '',
    dueDate: '',
    billType: '',
    urgent: false, // New state for urgency
  });

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { selectedSwap } = route.params;

  const swapTypes = [
    { label: 'Exact Matches', value: 'Exact Matches: Swap bills of equal amounts.' },
    { label: 'Fractional Swaps', value: 'Fractional Swaps: Allow partial payments where users cover a portion of each other’s bills.' },
    { label: 'Multiple Swaps', value: 'Multiple Swaps: Split larger bills across multiple users.' },
    { label: 'Group Swaps', value: 'Group Swaps: Multiple users pool their bills into a group and collectively swap with another group of users.' },
    { label: 'Flexible Payment Swaps', value: 'Flexible Payment Swaps: Allow users to negotiate flexible payment terms, such as paying in installments or choosing a different due date.' },
  ];

  const billTypeOptions = [
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Telecommunications', value: 'Telecommunications' },
    { label: 'Housing', value: 'Housing' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Education', value: 'Education' },
    { label: 'Credit and Loans', value: 'Credit and Loans' },
    { label: 'Subscriptions', value: 'Subscriptions' },
    { label: 'Groceries and Household Supplies', value: 'Groceries and Household Supplies' },
    { label: 'Childcare and Education', value: 'Childcare and Education' },
    { label: 'Entertainment and Dining Out', value: 'Entertainment and Dining Out' },
    { label: 'Insurance', value: 'Insurance' },
    { label: 'Donations', value: 'Donations' },
    { label: 'Taxes', value: 'Taxes' },
    { label: 'Legal Fees', value: 'Legal Fees' },
    { label: 'Maintenance and Repairs', value: 'Maintenance and Repairs' },
    { label: 'Pet Care', value: 'Pet Care' },
    { label: 'Personal Care', value: 'Personal Care' },
    { label: 'Savings and Investments', value: 'Savings and Investments' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Miscellaneous Fees', value: 'Miscellaneous Fees' },
    { label: 'Hobbies and Activities', value: 'Hobbies and Activities' },
    { label: 'Family Obligations', value: 'Family Obligations' },
    { label: 'Business Expenses', value: 'Business Expenses' },
    { label: 'Unexpected Expenses', value: 'Unexpected Expenses' },
  ];

  const canProceed = billDetails.provider && billDetails.amount && billDetails.dueDate && billDetails.billType && uploadedImage;

  const handleInputChange = (name, value) => {
    setBillDetails({ ...billDetails, [name]: value });
  };

  const handleUpload = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = { uri: response.assets[0].uri };
          setUploadedImage(source);
        }
      }
    );
  };

  const formatDate = (date) => {
    // Remove non-numeric characters
    const cleanDate = date.replace(/\D/g, '');

    // Apply formatting based on length
    if (cleanDate.length >= 7) {
      return `${cleanDate.slice(0, 2)}/${cleanDate.slice(2, 4)}/${cleanDate.slice(4, 8)}`;
    } else if (cleanDate.length >= 5) {
      return `${cleanDate.slice(0, 2)}/${cleanDate.slice(2, 4)}/${cleanDate.slice(4)}`;
    } else if (cleanDate.length >= 3) {
      return `${cleanDate.slice(0, 2)}/${cleanDate.slice(2)}`;
    } else {
      return cleanDate;
    }
  };

  const handleDateChange = (text) => {
    const formattedDate = formatDate(text);
    setBillDetails({ ...billDetails, dueDate: formattedDate });
  };

  const isValidDueDate = () => {
    const today = new Date();
    const [month, day, year] = billDetails.dueDate.split('/');
    const dueDate = new Date(year, month - 1, day);

    // Calculate the difference in days
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if the due date is within 7 days
    return diffDays > 7;
  };

  const handleNext = async () => {
    if (!isValidDueDate()) {
      setModalVisible(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: uploadedImage.uri,
      name: uploadedImage.uri.split('/').pop(),
      type: 'image/jpeg',
    });
    formData.append('amount_due', billDetails.amount);
    formData.append('due_date', billDetails.dueDate);
    formData.append('service_provider_name', billDetails.provider);
    formData.append('bill_type', billDetails.billType);
    formData.append('urgent', billDetails.urgent ? 'Yes' : 'No'); // Include urgency in the form data

    try {
      const response = await fetch('http://127.0.0.1:5000/upload-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`, // Use the token from the UserContext
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Bill uploaded successfully');
        navigation.navigate('FindMatches', { billDetails });
      } else {
        Alert.alert('Error', result.message || 'Failed to upload bill');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header/>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.videoCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={require('../assets/circle-left-regular.png')} style={styles.backButtonIcon} />
          </TouchableOpacity>
          <Text style={styles.cardTitle}>How It Works</Text>
          <View style={styles.videoPlaceholder}>
            <Text>Video/Animation Placeholder</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Bill</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload Bill</Text>
          </TouchableOpacity>
          {uploadedImage && (
            <Image source={uploadedImage} style={styles.uploadedImage} />
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Swap Type</Text>
          <Dropdown
            style={styles.dropdown}
            data={swapTypes}
            labelField="label"
            valueField="value"
            placeholder="Select a Swap Type"
            value={selectedSwap}
            onChange={(item) => {
              setBillDetails({ ...billDetails, swapType: item.value });
            }}
            selectedTextStyle={styles.dropdownText}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Bill Type</Text>
          <Dropdown
            style={styles.dropdown}
            data={billTypeOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a Bill Type"
            value={billDetails.billType}
            onChange={(item) => {
              handleInputChange('billType', item.value);
            }}
            selectedTextStyle={styles.dropdownText}
          />
        </View>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify Bill Details</Text>
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
            placeholder="Due Date (mm/dd/yyyy)"
            value={billDetails.dueDate}
            onChangeText={handleDateChange}
            keyboardType="numeric"
            maxLength={10}
          />
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={billDetails.urgent}
              onValueChange={(newValue) => handleInputChange('urgent', newValue)}
            />
            <Text style={styles.checkboxLabel}>Urgent</Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: canProceed ? '#4A7C59' : '#CCCCCC' }]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <Text style={styles.modalTitle}>Attention Needed</Text>
            <Text style={styles.modalText}>
              The due date for this bill is too close to ensure a successful swap. Please select a due date that is at least 7 days away to allow time for processing.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7E6', // Light green background for a calm and inviting feel
  },
  scrollContainer: {
    padding: 20,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  backButtonIcon: {
    width: 30,
    height: 30,
    tintColor: '#4A7C59',
  },
  videoPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A7C59',
  },
  primaryButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A7C59',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadedImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#4A7C59',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default BillInformationCollection;
