import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useNavigation } from '@react-navigation/native';

const trustScoreData = [
  {
    title: 'Ways to Earn Trust Points',
    items: [
      {
        main: 'Completing a Standard Swap → +0.10 Trust Points',
        sub: ['Must be confirmed by both parties.'],
      },
      {
        main: 'Buying a Public Bill → +0.10–0.20 Trust Points',
        sub: [
          'Base: +0.10',
          'Bonus: +0.05 if due soon (within 2 days)',
          'Bonus: +0.05 if user has Trusted Helper badge',
        ],
      },
      {
        main: 'Completing an Urgent Swap Fast → +0.05–0.15 Trust Points',
        sub: [
          '< 24 hrs = +0.15',
          '1–2 days = +0.10',
          'Normal timing = +0.05',
        ],
      },
      {
        main: 'Positive Feedback (4★ or 5★ rating) → +0.05 Trust Points per rating',
      },
      {
        main: 'Daily Voting Streak → +0.01 Trust Points per day',
        sub: ['Bonus: +0.10 at 7-day streak'],
      },
      {
        main: 'Weekly Consistency → +0.10 Trust Points',
        sub: ['Helping at least once a week for 3 consecutive weeks'],
      },
      {
        main: 'Following Through on Accepted Swaps → +0.20 Trust Points',
        sub: ['Avoids ghosting or canceling after committing'],
      },
    ],
  },
  {
    title: 'Ways to Lose Trust Points',
    items: [
      {
        main: 'Fakes or Confirms Help Dishonestly → −0.50 Trust Points',
        sub: ['If proof or assistance was falsified'],
      },
      {
        main: 'Ghosts After Agreeing to Help → −0.30 Trust Points',
      },
      {
        main: 'Bill Flagged as Fake or Unverifiable → −0.40 Trust Points',
      },
      {
        main: 'Repeated Last-Minute Cancellations → −0.20 Trust Points',
      },
      {
        main: 'Long-Term Inactivity (60+ days) → −0.10 Trust Points',
      },
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
  <View key={idx} style={{ marginBottom: 16 }}>
  <Text style={styles.answer}>
    • <Text style={{ fontWeight: '600' }}>{item.main}</Text>
  </Text>
  {item.sub &&
    item.sub.map((subItem, subIdx) => (
      <Text key={subIdx} style={styles.subBullet}>
        – {subItem}
      </Text>
    ))}
</View>

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
  subBullet: {
    fontSize: 14,
    color: '#555',
    paddingLeft: 28, // bumped from 20 to 28 for cleaner visual hierarchy
    lineHeight: 20,
    marginTop: 2,
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
