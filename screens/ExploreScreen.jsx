import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Header from '../screens/Header';

// Mock data for demonstration
const bonuses = [
  { id: '1', category: 'Groceries', bonus: '10% Cashback' },
  { id: '2', category: 'Utilities', bonus: '5% Cashback' },
];
const challenges = [
  { id: '1', challenge: 'Save $1000 in a month' },
  { id: '2', challenge: 'Track all expenses for a week' },
];
const educationalResources = [
  { id: '1', title: 'How to Save Money', description: 'Tips and tricks on saving money effectively.' },
  { id: '2', title: 'Investment Basics', description: 'Learn the basics of investing.' },
];
const charities = [
  { id: '1', name: 'Charity A', impact: 'Provides clean water to communities' },
  { id: '2', name: 'Charity B', impact: 'Supports education for underprivileged children' },
];
const widgets = {
  leaderboard: [
    { id: '1', name: 'User1', score: 1500 },
    { id: '2', name: 'User2', score: 1200 },
  ],
  featuredArticles: [
    { id: '1', title: 'How to Budget', snippet: 'Learn the best budgeting techniques.' },
    { id: '2', title: 'Debt Management', snippet: 'Tips for managing and reducing debt.' },
  ],
};
const bills = [
  { id: '1', user: 'User1', description: 'Need assistance with medical bills', amount: '$200' },
  { id: '2', user: 'User2', description: 'Struggling with rent this month', amount: '$800' },
];

const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Explore</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Rotating Category Bonuses</Text>
          <FlatList
            data={bonuses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text>{item.category}: {item.bonus}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Challenges and Goals</Text>
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text>{item.challenge}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Educational Resources</Text>
          <FlatList
            data={educationalResources}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.bold}>{item.title}</Text>
                <Text>{item.description}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Charity Voting System</Text>
          <FlatList
            data={charities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.bold}>{item.name}</Text>
                <Text>{item.impact}</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Vote</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Widgets</Text>
          <View style={styles.widget}>
            <Text style={styles.bold}>Leaderboard</Text>
            {widgets.leaderboard.map((item) => (
              <Text key={item.id}>{item.name}: {item.score} points</Text>
            ))}
          </View>
          <View style={styles.widget}>
            <Text style={styles.bold}>Featured Articles</Text>
            {widgets.featuredArticles.map((item) => (
              <View key={item.id}>
                <Text style={styles.bold}>{item.title}</Text>
                <Text>{item.snippet}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Assistance Needed</Text>
          <FlatList
            data={bills}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.billItem}>
                <Text style={styles.bold}>{item.user}</Text>
                <Text>{item.description}</Text>
                <Text>Amount: {item.amount}</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Donate</Text>
                </TouchableOpacity>
              </View>
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.scrollContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  navbar: {
    backgroundColor: '#5fa052',
    padding: 15,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5fa052',
  },
  item: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  widget: {
    marginBottom: 10,
  },
  billItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    elevation: 3,
  },
  scrollContainer: {
    height: 300,
  },
});

export default ExploreScreen;
