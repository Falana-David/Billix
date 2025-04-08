import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pollQuestions = require('./pollQuestions.json');

const calculateTimeLeft = (lastVotedTime, pollType) => {
  const now = new Date();
  const lastVotedDate = new Date(lastVotedTime);
  let nextVoteTime = new Date(lastVotedDate);

  switch (pollType) {
    case 'daily':
      nextVoteTime.setDate(lastVotedDate.getDate() + 1);
      break;
    case 'weekly':
      nextVoteTime.setDate(lastVotedDate.getDate() + 7);
      break;
    case 'monthly':
      nextVoteTime.setMonth(lastVotedDate.getMonth() + 1);
      break;
    default:
      throw new Error('Invalid poll type');
  }

  const timeLeft = nextVoteTime - now;
  if (timeLeft < 0) {
    return 'You can vote now!';
  }

  let seconds = Math.floor((timeLeft / 1000) % 60);
  let minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  let hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  return `Time until next vote: ${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const determineWinningOption = (votes, pollType) => {
  const options = pollQuestions[pollType].map((_, index) => votes[`${pollType}_${index}`] || 0);
  const maxVotes = Math.max(...options);
  return options.indexOf(maxVotes);
};

const CommunityVotingScreen = ({ navigation }) => {
  const [votes, setVotes] = useState({});
  const [lastVoted, setLastVoted] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [timer, setTimer] = useState({});

  useEffect(() => {
    const loadLastVotedTimes = async () => {
      const lastVotedTimes = {
        daily: await AsyncStorage.getItem('lastVoted_daily'),
        weekly: await AsyncStorage.getItem('lastVoted_weekly'),
        monthly: await AsyncStorage.getItem('lastVoted_monthly'),
      };
      setLastVoted({
        daily: lastVotedTimes.daily ? new Date(lastVotedTimes.daily) : null,
        weekly: lastVotedTimes.weekly ? new Date(lastVotedTimes.weekly) : null,
        monthly: lastVotedTimes.monthly ? new Date(lastVotedTimes.monthly) : null,
      });
    };

    loadLastVotedTimes();
    const intervalId = setInterval(() => {
      setTimer({
        daily: calculateTimeLeft(lastVoted.daily, 'daily'),
        weekly: calculateTimeLeft(lastVoted.weekly, 'weekly'),
        monthly: calculateTimeLeft(lastVoted.monthly, 'monthly'),
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [lastVoted]);

  const handleVote = async (pollType, questionIndex) => {
    const now = new Date();
    const timeDiff = lastVoted[pollType] ? now - lastVoted[pollType] : Infinity;
    const timeLimits = { daily: 86400000, weekly: 604800000, monthly: 2592000000 };

    if (timeDiff < timeLimits[pollType]) {
      Alert.alert('Voting Restriction', `You can only vote once per ${pollType}.`);
      return;
    }

    const updatedVotes = { ...votes, [`${pollType}_${questionIndex}`]: (votes[`${pollType}_${questionIndex}`] || 0) + 1 };
    setVotes(updatedVotes);
    const updatedLastVoted = { ...lastVoted, [pollType]: now };
    setLastVoted(updatedLastVoted);
    await AsyncStorage.setItem(`lastVoted_${pollType}`, now.toISOString());
    Alert.alert('Vote Successful', 'Thank you for your vote!');
  };

  const openModal = (question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  const openInfoModal = (message) => {
    setInfoMessage(message);
    setInfoModalVisible(true);
  };

  const renderPollSection = (pollType, pollTitle, infoMessage) => {
    const timeLeft = timer[pollType] || 'You can vote now!';
    const winningOption = determineWinningOption(votes, pollType);
    return (
      <View style={styles.pollSection}>
        <View style={styles.pollHeader}>
          <Text style={styles.pollTitle}>{pollTitle}</Text>
          <TouchableOpacity onPress={() => openInfoModal(infoMessage)}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        {pollQuestions[pollType].slice(0, 2).map((item, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionText}>{item.question}</Text>
            <Text style={styles.voteResultText}>Votes: {votes[`${pollType}_${index}`] || 0} (Currently Winning: {winningOption === index ? 'Yes' : 'No'})</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(pollType, index)}>
                <Text style={styles.voteButtonText}>Vote</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoButton} onPress={() => openModal(item)}>
                <Text style={styles.infoButtonText}>Info</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.timeLeftText}>{timeLeft}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerPlacement}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={require('./assets/circle-left-regular.png')} style={styles.backButtonIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Voting</Text>
        </View>
        {renderPollSection('daily', 'Daily Voting', 'This is daily voting. You can vote once every day.')}
        {renderPollSection('weekly', 'Weekly Voting', 'This is weekly voting. You can vote once every week.')}
        {renderPollSection('monthly', 'Monthly Voting', 'This is monthly voting. You can vote once every month.')}
        {selectedQuestion && (
          <Modal transparent={true} animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedQuestion.question}</Text>
                <Text style={styles.modalDescription}>{selectedQuestion.description}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        {infoModalVisible && (
          <Modal transparent={true} visible={infoModalVisible} onRequestClose={() => setInfoModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Information</Text>
                <Text style={styles.modalDescription}>{infoMessage}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A7C59',
  },
  scrollView: {
    paddingTop: 10,  // Space for the header
  },
  headerPlacement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  pollSection: {
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pollTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796B',
  },
  infoIcon: {
    fontSize: 24,
    color: '#00796B',
  },
  questionCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    color: '#37474F',
    textAlign: 'center',
  },
  voteResultText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#4A7C59',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFB74D',
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#4A7C59',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeLeftText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
});

export default CommunityVotingScreen;
