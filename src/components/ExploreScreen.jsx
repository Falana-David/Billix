import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext';
import ToggleSwitch from 'toggle-switch-react-native';

const API_URL = 'http://127.0.0.1:5000';

// List of available profile pictures
const profilePictures = [
  require('./assets/lion.png'),
  require('./assets/tiger.png'),
  require('./assets/bird.png'),
  require('./assets/deer.png'),
  require('./assets/elephant.png'),
  require('./assets/giraffe.png'),
  require('./assets/sheep.png'),
  require('./assets/whale.png'),
];

// Function to get a random profile picture
const getRandomImage = () => {
  return profilePictures[Math.floor(Math.random() * profilePictures.length)];
};

const billTypeOptions = [
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Housing', value: 'Housing' },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
];

const ExploreScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [billType, setBillType] = useState('Utilities');
  const [sortType, setSortType] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExplore, setIsExplore] = useState(true);
  const { user } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]); // For bookmarked questions
  const [points, setPoints] = useState(0); // For karma or points system

  const trophyIcon = require('./assets/trophy.png');
  const replyIcon = require('./assets/reply.png');
  const upArrowIcon = require('./assets/up-arrow.png');
  const downArrowIcon = require('./assets/down-arrow.png');
  const chatBubbleIcon = require('./assets/chat-bubble.png');

  const fetchQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/questions?bill_type=${billType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        if (!Array.isArray(data)) {
          console.error('Fetched data is not an array:', data);
          return;
        }
        const questionsWithImages = data.map((question) => ({
          ...question,
          image: question.is_anonymous
            ? getRandomImage()
            : question.profile_picture
            ? { uri: question.profile_picture }
            : getRandomImage(),
          date: question.created_at,
          userUniqueId: question.user_unique_id,
          replies: (question.replies || []).map((reply) => ({
            ...reply,
            text: reply.reply_text,
            profilePicture: reply.is_anonymous
              ? getRandomImage()
              : reply.profile_picture
              ? { uri: reply.profile_picture }
              : getRandomImage(),
            likes: reply.upvotes || 0,
            dislikes: reply.downvotes || 0,
            liked: false,
            disliked: false,
            date: reply.created_at,
          })),
          likes: question.upvotes || 0,
          dislikes: question.downvotes || 0,
          liked: false,
          disliked: false,
          localReply: '',
        }));
        setQuestions(questionsWithImages);
      } else {
        console.error('Failed to fetch questions:', data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [billType]);

  const handleAskQuestion = async () => {
    const questionData = {
      title: title.trim(),
      question_text: body.trim(),
      bill_type: billType,
      is_anonymous: isAnonymous,
    };

    if (!questionData.title || !questionData.question_text) {
      console.error('Missing required fields:', questionData);
      return;
    }

    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      const responseText = await response.text();  // Retrieve the full response text
      console.log('Response Status:', response.status);
      console.log('Response Text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        const questionWithImage = {
          ...data,
          image: isAnonymous
            ? getRandomImage()
            : user?.profilePicture
            ? { uri: user.profilePicture }
            : getRandomImage(),
          date: data.created_at,
          userUniqueId: data.user_unique_id,
          replies: [],
          localReply: '',
          likes: 0,
          dislikes: 0,
          liked: false,
          disliked: false,
        };
        setQuestions([...questions, questionWithImage]);
        setTitle('');
        setBody('');
        setModalVisible(false);
        setPoints((prev) => prev + 10); // Increase points for asking a question
      } else {
        console.error('Failed to post question:', responseText);
      }
    } catch (error) {
      console.error('Error posting question:', error.message || error);
    }
  };

  const handleLikeDislike = async (index, isReply = false, replyIndex = null, action = 'like') => {
    const token = await AsyncStorage.getItem('token');
    const updatedQuestions = [...questions];

    if (isReply && replyIndex !== null) {
      const reply = updatedQuestions[index].replies[replyIndex];
      const replyId = reply.id;
      const questionId = updatedQuestions[index].id;

      try {
        const response = await fetch(`${API_URL}/questions/${questionId}/replies/${replyId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: action === 'like' ? 'up' : 'down' }),
        });

        if (response.ok) {
          const data = await response.json();
          reply.likes = data.upvotes;
          reply.dislikes = data.downvotes;
          reply.liked = action === 'like' ? !reply.liked : false;
          reply.disliked = action === 'dislike' ? !reply.disliked : false;
          setQuestions(updatedQuestions);
        }
      } catch (error) {
        console.error('Error voting reply:', error);
      }
    } else {
      const question = updatedQuestions[index];
      const questionId = question.id;

      try {
        const response = await fetch(`${API_URL}/questions/${questionId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: action === 'like' ? 'up' : 'down' }),
        });

        if (response.ok) {
          const data = await response.json();
          question.likes = data.upvotes;
          question.dislikes = data.downvotes;
          question.liked = action === 'like' ? !question.liked : false;
          question.disliked = action === 'dislike' ? !question.disliked : false;
          setQuestions(updatedQuestions);
        }
      } catch (error) {
        console.error('Error voting question:', error);
      }
    }
  };

  const handleSaveQuestion = (question) => {
    if (savedQuestions.find((saved) => saved.id === question.id)) {
      Alert.alert('Already saved', 'This question is already in your saved list.');
    } else {
      setSavedQuestions([...savedQuestions, question]);
      Alert.alert('Saved', 'Question has been saved for later reference.');
    }
  };

  const handleReportQuestion = (question) => {
    Alert.alert(
      'Report Question',
      'Are you sure you want to report this question as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            Alert.alert('Reported', 'Question has been reported for review.');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/questions/${questions[questionToDelete].id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setQuestions((prevQuestions) => prevQuestions.filter((_, index) => index !== questionToDelete));
        setIsDeleteModalVisible(false);
      } else {
        console.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const filteredQuestions = questions
    .filter((question) =>
      question.bill_type === billType &&
      (searchQuery.trim() === '' || question.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (sortType === 'newest' ? new Date(b.date) - new Date(a.date) : b.likes - a.likes));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  const handleToggle = () => {
    setIsExplore(!isExplore);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isExplore ? 'Explore' : 'Campaign'}</Text>
        <ToggleSwitch
          isOn={isExplore}
          onColor="#4A7C59"
          offColor="#ADD8E6"
          size="medium"
          onToggle={handleToggle}
          style={styles.switch}
          thumbOnStyle={styles.thumbOnStyle}
          thumbOffStyle={styles.thumbOffStyle}
          trackOnStyle={styles.trackOnStyle}
          trackOffStyle={styles.trackOffStyle}
        />
      </View>

      {isExplore ? (
        <>
          <View style={styles.filterContainer}>
            <Dropdown
              style={styles.dropdown}
              data={billTypeOptions}
              labelField="label"
              valueField="value"
              value={billType}
              onChange={(item) => setBillType(item.value)}
              placeholder="Filter by Bill Type"
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
            />
            <Dropdown
              style={styles.dropdown}
              data={sortOptions}
              labelField="label"
              valueField="value"
              onChange={(item) => setSortType(item.value)}
              placeholder="Sort by"
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
            />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredQuestions}
            renderItem={({ item, index }) => {
              const createdAt = new Date().toLocaleDateString();
              const userUniqueId = item.userUniqueId ? item.userUniqueId.slice(0, 8) : '';
              const isUserQuestion = userUniqueId === (user?.unique_id ? user.unique_id.slice(0, 8) : '');

              return (
                <View style={styles.questionCard}>
                  <Image source={item.image} style={styles.profilePicture} />
                  <View style={styles.questionContent}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionTitle}>{item.title || 'No Title'}</Text>
                      <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={() => handleSaveQuestion(item)}>
                          <Image source={require('./assets/bookmark.png')} style={{ tintColor: '#000', width: 20, height: 20 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReportQuestion(item)} style={{ marginLeft: 10 }}>
                          <Image source={require('./assets/flag.png')} style={{ tintColor: '#000', width: 20, height: 20 }} />
                        </TouchableOpacity>
                        {isUserQuestion && (
                          <>
                            <TouchableOpacity onPress={() => handleIconPress('edit', index)} style={{ marginLeft: 10 }}>
                              <Image source={require('./assets/edit.png')} style={{ tintColor: '#000', width: 20, height: 20 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleIconPress('delete', index)} style={{ marginLeft: 10 }}>
                              <Image source={require('./assets/trash.png')} style={{ tintColor: '#000', width: 20, height: 20 }} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                    <Text style={styles.questionBody}>{item.question_text || 'No Body'}</Text>
                    <Text style={styles.idText}>ID: {userUniqueId}</Text>
                    <Text style={styles.dateText}>
                      Posted on {createdAt}
                    </Text>

                    <View style={styles.likeDislikeContainer}>
                      <TouchableOpacity onPress={() => handleLikeDislike(index, false, null, 'like')}>
                        <Image source={upArrowIcon} style={{ tintColor: '#000', width: 24, height: 24 }} />
                      </TouchableOpacity>
                      <Text>{item.likes}</Text>
                      <TouchableOpacity onPress={() => handleLikeDislike(index, false, null, 'dislike')}>
                        <Image source={downArrowIcon} style={{ tintColor: '#000', width: 24, height: 24 }} />
                      </TouchableOpacity>
                      <Text>{item.dislikes}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.replyArrow}
                      onPress={() => {
                        const updatedQuestions = questions.map((question) =>
                          question.id === item.id ? { ...question, showReply: !question.showReply } : question
                        );
                        setQuestions(updatedQuestions);
                      }}
                    >
                      <Image source={replyIcon} style={{ tintColor: '#000', width: 24, height: 24, marginRight: 5 }} />
                      <Text style={styles.replyText}>Reply</Text>
                    </TouchableOpacity>
                    {item.showReply && (
                      <>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Write a reply..."
                          value={item.localReply}
                          onChangeText={(text) => {
                            const updatedQuestions = questions.map((question) =>
                              question.id === item.id ? { ...question, localReply: text } : question
                            );
                            setQuestions(updatedQuestions);
                          }}
                        />
                        <View style={styles.anonymousToggle}>
                          <Text style={styles.modalLabel}>Reply Anonymously</Text>
                          <ToggleSwitch
                            isOn={item.isAnonymousReply || false}
                            onColor="#4A7C59"
                            offColor="#ADD8E6"
                            size="small"
                            onToggle={(isOn) => {
                              const updatedQuestions = questions.map((question) =>
                                question.id === item.id ? { ...question, isAnonymousReply: isOn } : question
                              );
                              setQuestions(updatedQuestions);
                            }}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.replyButton}
                          onPress={() => handleAddReply(item.id, item.localReply, item.isAnonymousReply)}
                          disabled={!item.localReply.trim()}
                        >
                          <Text style={styles.replyText}>Reply</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {item.replies.length > 0 && (
                      <View style={styles.repliesContainer}>
                        {item.replies.map((reply, idx) => {
                          const replyDate = new Date().toLocaleDateString();
                          return (
                            <View key={idx} style={styles.replyCard}>
                              <Image source={reply.profilePicture} style={styles.replyProfilePicture} />
                              <View style={styles.replyContent}>
                                <Text style={styles.replyTextStyle}>{reply.text || 'No reply text available'}</Text>
                                <Text style={styles.replyDateText}>Replied on {replyDate}</Text>
                                <View style={styles.likeDislikeContainer}>
                                  <TouchableOpacity onPress={() => handleLikeDislike(index, true, idx, 'like')}>
                                    <Image source={upArrowIcon} style={{ tintColor: '#000', width: 20, height: 20 }} />
                                  </TouchableOpacity>
                                  <Text>{reply.likes}</Text>
                                  <TouchableOpacity onPress={() => handleLikeDislike(index, true, idx, 'dislike')}>
                                    <Image source={downArrowIcon} style={{ tintColor: '#000', width: 20, height: 20 }} />
                                  </TouchableOpacity>
                                  <Text>{reply.dislikes}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.flatListStyle}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </>
      ) : null}

      {isExplore && (
        <TouchableOpacity style={styles.askButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.askButtonText}>Ask a Question</Text>
        </TouchableOpacity>
      )}

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={title}
              onChangeText={(text) => setTitle(text.slice(0, 100))} // Limit to 100 characters
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Body"
              value={body}
              onChangeText={setBody}
              multiline
            />
            <Dropdown
              style={styles.dropdown}
              data={billTypeOptions}
              labelField="label"
              valueField="value"
              value={billType}
              onChange={(item) => setBillType(item.value)}
              placeholder="Select bill type"
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
            />
            <View style={styles.anonymousToggle}>
              <Text style={styles.modalLabel}>Post Anonymously</Text>
              <ToggleSwitch
                isOn={isAnonymous}
                onColor="#4A7C59"
                offColor="#ADD8E6"
                size="small"
                onToggle={(isOn) => setIsAnonymous(isOn)}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleAskQuestion}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to delete this question?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#999' }]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Points: {points}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Guidelines')}>
          <Text style={styles.footerLink}>View Community Guidelines</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3b5998',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  switch: {
    marginRight: 10,
  },
  thumbOnStyle: {
    backgroundColor: '#E6E6FA', // Lavender
  },
  thumbOffStyle: {
    backgroundColor: '#4A7C59', // Dark Sage Green
  },
  trackOnStyle: {
    backgroundColor: '#4A7C59', // Dark Sage Green
  },
  trackOffStyle: {
    backgroundColor: '#ADD8E6', // Light Blue
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdown: {
    width: '45%',
    backgroundColor: '#E6E6FA',
    borderRadius: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ADD8E6',
  },
  placeholderStyle: {
    color: '#3b5998',
    fontSize: 14,
  },
  selectedTextStyle: {
    color: '#3b5998',
    fontSize: 14,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#E6E6FA',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
  },
  questionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#E6E6FA',
  },
  questionContent: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 10,
  },
  questionBody: {
    marginTop: 5,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  idText: {
    marginTop: 5,
    color: '#000',
    fontSize: 12,
  },
  dateText: {
    marginTop: 5,
    color: '#999',
    fontSize: 12,
  },
  likeDislikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  replyArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  replyInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 14,
    color: '#333',
  },
  replyButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#3b5998',
    alignSelf: 'flex-start',
  },
  replyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  repliesContainer: {
    marginTop: 10,
  },
  replyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  replyProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#E6E6FA',
  },
  replyContent: {
    flex: 1,
  },
  replyTextStyle: {
    fontSize: 14,
    color: '#000',
  },
  askButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: '#3b5998',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#3b5998',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#3b5998',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListStyle: {
    paddingBottom: 100,
  },
  replyDateText: {
    marginTop: 5,
    color: '#999',
    fontSize: 12,
  },
  anonymousToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,  // Slight margin on top for spacing
  },
  modalLabel: {
    fontSize: 12,  // Smaller font size for anonymous text
    color: '#333',
  },
  footer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#333',
  },
  footerLink: {
    fontSize: 14,
    color: '#3b5998',
    textDecorationLine: 'underline',
  },
});

export default ExploreScreen;
