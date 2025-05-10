import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useNavigation } from '@react-navigation/native';

const trustScoreData = [
  {
    title: 'Ways to Earn Trust Points',
    items: [
      'Successfully helps another user (confirmed) — +0.2',
      'Uploads bill with all required info and passes ID verification — +0.1',
      'Receives positive feedback from partner — +0.2',
      'Consistent participation (e.g. once a week for 3 weeks) — +0.1',
      'Follows through on agreed swaps or contributions — +0.2',
    ],
  },
  {
    title: 'Ways to Lose Trust Points',
    items: [
      'Confirms a help interaction dishonestly — -0.5',
      'Ghosts another user after committing to help — -0.3',
      'Bill is flagged as fake or unverifiable — -0.4',
      'Repeated last-minute cancellations — -0.2',
      'Long-term inactivity (e.g. 60+ days) — -0.1',
    ],
  },
];

const TrustScoreScreen = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Billix Trust Score</Text>

        {trustScoreData.map((section, index) => {
          const isOpen = activeIndex === index;
          return (
            <View key={index} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleIndex(index)}
              >
                <Text style={styles.question}>{section.title}</Text>
                <Text style={styles.arrow}>{isOpen ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              <Collapsible collapsed={!isOpen}>
                <View style={styles.cardBody}>
                  {section.items.map((item, idx) => (
                    <Text key={idx} style={styles.answer}>• {item}</Text>
                  ))}
                </View>
              </Collapsible>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    color: '#4A7C59',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#DFF5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    color: '#2F5D4A',
    fontWeight: '600',
    flexShrink: 1,
    paddingRight: 10,
  },
  arrow: {
    fontSize: 18,
    color: '#4A7C59',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  answer: {
    fontSize: 15,
    color: '#3b3b3b',
    lineHeight: 22,
    marginBottom: 6,
  },
});

export default TrustScoreScreen;
