import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import Header from '../Header';
import { Dropdown } from 'react-native-element-dropdown';

const BillSwapSelection = ({ navigation }) => {
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const swapTypes = [
    { label: 'Exact Matches', value: 'Exact Matches: Swap bills of equal amounts.' },
    { label: 'Fractional Swaps', value: 'Fractional Swaps: Allow partial payments where users cover a portion of each other’s bills.' },
    { label: 'Multiple Swaps', value: 'Multiple Swaps: Split larger bills across multiple users.' },
    { label: 'Group Swaps', value: 'Group Swaps: Multiple users pool their bills into a group and collectively swap with another group of users.' },
    { label: 'Flexible Payment Swaps', value: 'Flexible Payment Swaps: Allow users to negotiate flexible payment terms, such as paying in installments or choosing a different due date.' },
  ];

  const handleStartSwapping = () => {
    if (!selectedSwap) {
      alert('Please select a swap type before proceeding.');
    } else {
      navigation.navigate('BillInformationCollection', { selectedSwap: selectedSwap });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="BillSwap" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.introSection}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={require('../assets/circle-left-regular.png')} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <Text style={styles.introTitle}>Welcome to BillSwap Selection</Text>
          </View>
          <Text style={styles.introDescription}>
            Select the type of swap you'd like to perform. Use the dropdown below to choose a swap type.
          </Text>
          <View style={styles.howItWorks}>
            <Text style={styles.howItWorksTitle}>How It Works</Text>
            <View style={styles.videoPlaceholder}>
              <Text>Video/Animation Placeholder</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={swapTypes}
            labelField="label"
            valueField="value"
            placeholder="Select Swap Type"
            value={selectedSwap}
            onChange={item => {
              setSelectedSwap(item.value);
            }}
          />
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: selectedSwap ? '#4A7C59' : '#CCCCCC' }]}
            onPress={handleStartSwapping}
            disabled={!selectedSwap}
          >
            <Text style={styles.primaryButtonText}>Start Swapping</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryButton, styles.infoButton]} onPress={() => alert('Learn more about swapping')}>
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.trackerSection, { opacity: fadeAnim }]}>
          <Text style={styles.trackerTitle}>Today's Distribution</Text>
          <Text style={styles.trackerAmount}>${totalDistributed}</Text>
          <Text style={styles.trackerDescription}>
            Total amount distributed to users today through shared profits, rewards, and swap incentives.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    marginTop: -10,
    marginLeft: -10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonIcon: {
    width: 25,
    height: 25,
    tintColor: '#4A7C59',
  },
  scrollContainer: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
    flex: 1,
  },
  introDescription: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  howItWorks: {
    marginBottom: 20,
    alignItems: 'center',
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdown: {
    backgroundColor: '#7B9F7B', // Different color for the dropdown
    borderRadius: 10,
    padding: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 18, // Same text size as other buttons
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trackerSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  trackerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  trackerAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 10,
  },
  trackerDescription: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#4A7C59',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18, // Same text size as other buttons
  },
  secondaryButton: {
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '100%',
  },
  infoButton: {
    marginTop: 50,
  },
});

export default BillSwapSelection;
