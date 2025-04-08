import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CampaignDetails = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Billix Campaigns</Text>
      <Text style={styles.description}>
        This is the place to find help with your bills. Every campaign post will be seen,
        guaranteeing higher chances of donations.
      </Text>
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Campaigns</Text>
        {/* Add logic to display featured campaigns here */}
      </View>
      <View style={styles.endingSection}>
        <Text style={styles.sectionTitle}>Ending Campaigns</Text>
        {/* Add logic to display ending campaigns here */}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="View All Campaigns" onPress={() => navigation.navigate('AllCampaigns')} />
        <Button title="Create Campaign" onPress={() => navigation.navigate('CreateCampaign')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f6f9',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3b5998',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b5998',
  },
  endingSection: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default CampaignDetails;
