// StartSwapScreenNoMap.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const billOptions = [
  { id: '1', type: 'Internet', urgency: 'Due in 2 hrs', reward: '$15.72', badge: 'Priority Match' },
  { id: '2', type: 'Rent', urgency: 'Due in 1 day', reward: '$14.61', badge: 'Standard' },
  { id: '3', type: 'Electricity', urgency: 'Due in 5 hrs', reward: '$12.89', badge: 'Wait & Save' },
  { id: '4', type: 'Phone Bill', urgency: 'Due in 12 hrs', reward: '$16.75', badge: 'Quick Bonus' },
];

const StartSwap = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Start Swapping</Text>

      <FlatList
        data={billOptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedId === item.id && styles.cardSelected,
            ]}
            onPress={() => setSelectedId(item.id)}
          >
            <View>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.urgency}>{item.urgency}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.reward}>{item.reward}</Text>
              <Text style={styles.badge}>{item.badge}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.swapButton}>
        <Text style={styles.swapButtonText}>Start Swap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: {
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardSelected: {
    backgroundColor: '#e6e2ff',
    borderColor: '#6a5acd',
    borderWidth: 2,
  },
  type: { fontSize: 18, fontWeight: '600' },
  urgency: { fontSize: 14, color: '#666', marginTop: 4 },
  right: { alignItems: 'flex-end' },
  reward: { fontSize: 16, fontWeight: '700' },
  badge: { fontSize: 12, color: '#6a5acd', marginTop: 4 },
  swapButton: {
    backgroundColor: '#6a5acd',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  swapButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default StartSwap;
