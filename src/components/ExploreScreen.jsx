// ExploreScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import logo from './assets/logo.png';

const screenWidth = Dimensions.get('window').width;

const exploreItems = [
  { label: 'Utilities', route: 'HomeScreen' },
  { label: 'Rent', route: 'HomeScreen' },
  { label: 'Internet', route: 'HomeScreen' },
  { label: 'Loans', route: 'HomeScreen' },
];

const billMissions = [
  { id: 1, task: 'Write a 3-sentence product review', completed: false },
  { id: 2, task: 'Watch a video about saving money', completed: false },
  { id: 3, task: 'Share Billix on Twitter', completed: false },
];

const trends = [
  { title: 'Rent Up 3.2%', info: 'Rent prices have increased by 3.2% nationwide.', modalText: 'Graph showing rent trend over time' },
  { title: 'Internet Up 1.7%', info: 'Internet services increased across multiple regions.', modalText: 'Graph showing ISP costs' },
];

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [modalContent, setModalContent] = useState(null);
  const [missions, setMissions] = useState(billMissions);

  const toggleTaskCompletion = (id) => {
    const updated = missions.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setMissions(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Explore Billix</Text>

        <View style={styles.gridRow}>
          {exploreItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}>
              <Image source={logo} style={styles.cardBackground} />
              <Text style={styles.cardLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.graphBox}>
          <Text style={styles.graphTitle}>📉 Lower Your Bills</Text>
          <Text style={styles.graphSubtitle}>Your internet bill is 20% higher than average</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
              datasets: [
                { data: [60, 70, 72, 68, 75], color: () => '#4CAF50' },
                { data: [55, 58, 61, 59, 63], color: () => '#FF9800' },
              ],
              legend: ['Your Bill', 'National Avg'],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: () => '#1A3C40',
              labelColor: () => '#333',
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#1A3C40' },
            }}
            style={{ borderRadius: 16 }}
          />
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>🔁 Bill Missions</Text>
          <FlatList
            data={missions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.taskItem, item.completed && styles.taskCompleted]}
                onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={[styles.taskText, item.completed && styles.taskDone]}>{item.task}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.taskAdd}
            onPress={() => setModalContent('Add your own task feature coming soon')}>
            <Text style={styles.taskAddText}>+ Add Your Own Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>📈 Billix Market Trends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trends.map((trend, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendCard}
                onPress={() => setModalContent(trend.modalText)}>
                <Text style={styles.trendTitle}>{trend.title}</Text>
                <Text style={styles.trendInfo}>{trend.info}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>🏆 Top Billix Heroes</Text>
          <Text style={styles.graphSubtitle}>“I paid 3 bills last week just with Billix tasks”</Text>
        </View>

        <Modal visible={!!modalContent} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalContent}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalContent(null)}>
                <Text style={{ color: '#fff' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FCF9',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1A3C40',
    marginVertical: 24,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1EEDD',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.06,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#143434',
  },
  graphBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#143434',
    marginBottom: 6,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#143434',
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#F3F8F3',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  taskCompleted: {
    backgroundColor: '#C9EEC9',
  },
  taskText: {
    fontSize: 14,
    color: '#333',
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  taskAdd: {
    backgroundColor: '#1A3C40',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  taskAddText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
  trendCard: {
    backgroundColor: '#E7F6EC',
    padding: 14,
    marginRight: 12,
    borderRadius: 14,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3C40',
  },
  trendInfo: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#1A3C40',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1A3C40',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});


export default ExploreScreen;
