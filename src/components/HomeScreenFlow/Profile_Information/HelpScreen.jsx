import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HelpScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Billix Help Center</Text>

        <View style={styles.cardContainer}>
          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>How Billix Works</Text>
            <Text style={styles.paragraph}>
              Billix lets users swap bill payments by helping each other in a structured, safe way. Upload a bill after helping someone else and earn rewards!
            </Text>

            <Text style={styles.sectionTitle}>Need More Help?</Text>
            <Text style={styles.paragraph}>
              Contact us at info@billixapp.com or check our FAQ for more answers.
            </Text>

            <Text style={styles.sectionTitle}>Safety First</Text>
            <Text style={styles.paragraph}>
              We use identity verification, payment protections, and a transparent review system to keep Billix safe for everyone.
            </Text>
          </View>
        </View>

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
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F5D4A',
    marginBottom: 6,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#3b3b3b',
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default HelpScreen;
