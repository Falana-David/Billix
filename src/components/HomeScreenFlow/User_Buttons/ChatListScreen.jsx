import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../UserContext';

const ChatListScreen = () => {
  const { user } = useContext(UserContext);
  const [partners, setPartners] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/chat-partners', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPartners(res.data);
      } catch (err) {
        console.error('Error fetching chat partners:', err);
      }
    };

    fetchPartners();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ChatScreen', { partnerId: item.partner_id })}
    >
      <Text style={styles.name}>{item.name || `Partner #${item.partner_id}`}</Text>
      <Text style={styles.preview}>
        {item.last_message?.slice(0, 60) || 'No messages yet'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.header}> Your Conversations</Text>
        </View>

        <FlatList
          data={partners}
          renderItem={renderItem}
          keyExtractor={(item, i) => i.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chats yet. Help someone to start chatting!</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F5E9' },
  container: { flex: 1, padding: 16 },
  headerContainer: {
    marginBottom: 16,
  },
  backText: {
    color: '#4A7C59',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F5C42',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderColor: '#C9EBD9',
    borderWidth: 1,
    shadowColor: '#4A7C59',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontWeight: '700',
    fontSize: 17,
    color: '#1A3B2E',
  },
  preview: {
    color: '#556B5E',
    marginTop: 6,
    fontSize: 14,
  },
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#6C9983',
    fontSize: 15,
  },
});

export default ChatListScreen;
