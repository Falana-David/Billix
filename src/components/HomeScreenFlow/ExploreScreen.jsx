// ExploreScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
  Linking,
  RefreshControl,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ExploreScreen = () => {
  const [modalContent, setModalContent] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/bill-news');
      const data = await res.json();
      const keywordGroups = data.articles_by_keyword || {};
      const articles = Object.entries(keywordGroups).flatMap(([keyword, items]) =>
        items.map((item) => ({ ...item, keyword }))
      );
      setNewsData(articles);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Billix Market Updates</Text>

        {newsData.map((article, index) => (
          <TouchableOpacity
            key={index}
            style={styles.newsCard}
            onPress={() =>
              setModalContent({
                title: article.title,
                summary: article.summary,
                source: article.source,
                keyword: article.keyword,
                published: article.published,
                link: article.link,
              })
            }
          >
            <Text style={styles.newsTitle}>{article.title}</Text>
            <Text style={styles.newsSummary} numberOfLines={3}>
              {article.summary}
            </Text>
            <Text style={styles.newsMeta}>
              {article.source} • {article.published}
            </Text>
          </TouchableOpacity>
        ))}

        <Modal visible={!!modalContent} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                onPress={() => setModalContent(null)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{modalContent?.title}</Text>
              <Text style={styles.modalSummary}>{modalContent?.summary}</Text>

              <View style={styles.metaBlock}>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Source:</Text>{' '}
                  {modalContent?.source}
                </Text>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Keyword:</Text>{' '}
                  {modalContent?.keyword}
                </Text>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Published:</Text>{' '}
                  {modalContent?.published}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (modalContent?.link) {
                    Linking.canOpenURL(modalContent.link)
                      .then((supported) => {
                        if (supported) {
                          Linking.openURL(modalContent.link);
                        } else {
                          console.warn("Don't know how to open URI: " + modalContent.link);
                        }
                      })
                      .catch((err) => console.error('An error occurred', err));
                  }
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>Read Full Article</Text>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A3C40',
    marginVertical: 24,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#143434',
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  newsMeta: {
    fontSize: 12,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C40',
    marginBottom: 12,
  },
  modalSummary: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  metaBlock: {
    marginBottom: 20,
  },
  metaLabel: {
    fontWeight: '600',
    color: '#1A3C40',
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  linkButton: {
    backgroundColor: '#1A3C40',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ExploreScreen;
