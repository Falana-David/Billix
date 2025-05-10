import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../UserContext';

const ChatScreen = () => {
  const { user } = useContext(UserContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { partnerId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/get-messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(res.data.reverse());
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const messageToSend = input;
    setInput('');
  
    try {
      await axios.post(
        'http://127.0.0.1:5000/send-message',
        { receiver_id: partnerId, message: messageToSend },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchMessages(); // fetch actual saved messages
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  

  useEffect(() => {
    fetchMessages();
  }, [partnerId]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id === user.id ? styles.myBubble : styles.otherBubble
      ]}
    >
      <Text style={styles.messageText}>{item.message || item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={80}
      >
<View style={styles.header}>
  <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
  <Text style={styles.backText}>← Back</Text>
</TouchableOpacity>


    <Text style={styles.headerText}>Chat With Your Partner</Text>
  </View>

  <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')}>
    <Text style={styles.viewOther}>View Other Chats</Text>
  </TouchableOpacity>
</View>



        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.chatContent}
            inverted
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#94BFA1"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4FBF4', // soft mint background
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#CDE8D4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#E0F5E0',
    fontSize: 15,
    fontWeight: '500',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  viewOther: {
    color: '#E1FFE9',
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  
  chatContent: {
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F4FBF4',
    justifyContent: 'flex-end',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: '80%',
    shadowColor: '#D8F0E0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#CDEED8',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E1F3E6',
  },
  messageText: {
    fontSize: 15,
    color: '#1C1C1C',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#D0E9D5',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#F0FAF0',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#C5E6CF',
    color: '#2C2C2C',
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#4A7C59',
    borderRadius: 24,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ChatScreen;
