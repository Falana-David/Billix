import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import { UserContext } from '../UserContext';

const { width } = Dimensions.get('window');

const billCategories = ['Rent', 'Utilities', 'Credit Card', 'Phone', 'Medical', 'Streaming'];
const dueDateLevels = ['Any time', '10 days', '5 days', '1–2 days'];

const WelcomeToBillSwap = () => {
  const navigation = useNavigation();
  const [playVideo, setPlayVideo] = useState(false);
  const [tab, setTab] = useState('default');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dueDateComfort, setDueDateComfort] = useState(1);
  const [budgetRange, setBudgetRange] = useState(25);

  const handlePlay = () => setPlayVideo(true);
  useFocusEffect(useCallback(() => () => setPlayVideo(false), []));

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const [hasActiveSwap, setHasActiveSwap] = useState(false);
const { user } = useContext(UserContext);

const checkActiveSwaps = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/has-active-swap', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    const data = await res.json();
    setHasActiveSwap(data.has_active);
  } catch (err) {
    console.error('Failed to check active swap:', err);
  }
};


useEffect(() => {
  if (user?.token) checkActiveSwaps();
}, [user]);

useFocusEffect(
  useCallback(() => {
    if (user?.token) checkActiveSwaps();
  }, [user])
);






  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['default', 'preferences'].map((key) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={styles.tabButton}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {key === 'default' ? 'Intro' : 'Preferences'}
            </Text>
            {tab === key && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'default' ? (
        <>
          <Text style={styles.title}>Welcome to Billix Swap</Text>
          <Text style={styles.subtext}>Watch how it works</Text>

          <View style={styles.videoContainer}>
            {!playVideo ? (
              <TouchableOpacity style={styles.thumbnailWrapper} onPress={handlePlay}>
                <Image source={require('../assets/logo.png')} style={styles.thumbnail} />
                <LinearGradient colors={['#ffffffcc', '#ffffff00']} style={styles.fadeTop} />
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <Video
                source={require('../assets/Billix_Final_Animation.mp4')}
                style={styles.video}
                resizeMode="contain"
                controls
              />
            )}
          </View>

          <Text style={styles.description}>
            Bill Swap is your go-to solution for managing bills. Swap smart. Stay ahead.
          </Text>
        </>
      ) : (
        <View style={styles.whiteCard}>
          <Text style={styles.title}>Set Your Preferences</Text>

          {/* Bill Categories */}
          <View style={styles.section}>
            <Text style={styles.label}>Bill Types</Text>
            <View style={styles.pillsContainer}>
              {billCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  style={[
                    styles.pill,
                    selectedCategories.includes(cat) && styles.pillSelected,
                  ]}
                >
                  <Text
                    style={
                      selectedCategories.includes(cat)
                        ? styles.pillTextSelected
                        : styles.pillText
                    }
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date Preference */}
          <View style={styles.section}>
            <Text style={styles.label}>Due Date Comfort</Text>
            <Slider
              minimumValue={0}
              maximumValue={3}
              step={1}
              value={dueDateComfort}
              onValueChange={setDueDateComfort}
              minimumTrackTintColor="#3a6351"
              maximumTrackTintColor="#c8dcd2"
              thumbTintColor="#3a6351"
            />
            <Text style={styles.sliderLabel}>{dueDateLevels[dueDateComfort]}</Text>
          </View>

          {/* Budget Slider */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Willing to Contribute</Text>
            <Slider
              minimumValue={5}
              maximumValue={50}
              step={1}
              value={budgetRange}
              onValueChange={setBudgetRange}
              minimumTrackTintColor="#3a6351"
              maximumTrackTintColor="#c8dcd2"
              thumbTintColor="#3a6351"
            />
            <Text style={styles.sliderLabel}>${budgetRange}</Text>
          </View>
        </View>
      )}

<TouchableOpacity
  style={[styles.button, hasActiveSwap && styles.buttonDisabled]}
  onPress={() => {
    if (!hasActiveSwap) navigation.navigate('StartSwap');
  }}
  disabled={hasActiveSwap}
>
  <Text style={[styles.buttonText, hasActiveSwap && styles.buttonTextDisabled]}>
    {hasActiveSwap ? 'You Have an Active Swap' : 'Start Swapping'}
  </Text>
</TouchableOpacity>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 60,
    backgroundColor: '#f0f5f1',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 25,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#a1b2ab',
  },
  tabTextActive: {
    color: '#3a6351',
    fontWeight: '700',
  },
  underline: {
    marginTop: 6,
    height: 3,
    width: 60,
    backgroundColor: '#3a6351',
    borderRadius: 2,
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a6351',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtext: {
    fontSize: 14,
    color: '#6c7e77',
    marginBottom: 20,
  },
  videoContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 25,
    overflow: 'hidden',
    backgroundColor: '#e2f0e8',
  },
  thumbnailWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    height: 80,
    width: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '42%',
    backgroundColor: '#3a6351',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  playIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#4a5c55',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#3a6351',
    fontWeight: '600',
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cde4da',
  },
  pillSelected: {
    backgroundColor: '#3a6351',
    borderColor: '#3a6351',
  },
  pillText: {
    color: '#3a6351',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sliderLabel: {
    marginTop: 5,
    color: '#3a6351',
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3a6351',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc', // grey background
  },
  
  buttonTextDisabled: {
    color: '#666', // dimmed text
  },
  
});

export default WelcomeToBillSwap;
