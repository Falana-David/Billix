import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const BookmarkedQuestionsScreen = ({ route, navigation }) => {
  const { bookmarkedQuestions } = route.params;

  const handleRemoveBookmark = (questionId) => {
    const updatedBookmarks = bookmarkedQuestions.filter((question) => question.id !== questionId);
    navigation.setParams({ bookmarkedQuestions: updatedBookmarks });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bookmarked Questions</Text>
      {bookmarkedQuestions.length > 0 ? (
        <FlatList
          data={bookmarkedQuestions}
          renderItem={({ item }) => (
            <View style={styles.questionCard}>
              <Image source={item.image} style={styles.profilePicture} />
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>{item.title}</Text>
                <Text style={styles.questionBody}>{item.question_text}</Text>
                <TouchableOpacity onPress={() => handleRemoveBookmark(item.id)}>
                  <Text style={styles.removeBookmarkText}>Remove Bookmark</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noBookmarksText}>No bookmarks available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6f9',
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  questionContent: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questionBody: {
    fontSize: 14,
    marginBottom: 10,
  },
  removeBookmarkText: {
    color: 'red',
    textDecorationLine: 'underline',
  },
  noBookmarksText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookmarkedQuestionsScreen;
