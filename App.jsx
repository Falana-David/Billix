import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import UploadScreen from './screens/UploadScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CustomTabBar from './components/CustomTabBar';
import SignUpScreen from './screens/SignUpScreen';
import IntroductionScreen from './screens/IntroductionScreen';
import SignInScreen from './screens/SignInScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Main = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Upload" component={UploadScreen} />
    <Tab.Screen name="Rewards" component={RewardsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [hasSeenWelcomeScreen, setHasSeenWelcomeScreen] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenWelcomeScreen');
      if (hasSeen === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasSeenWelcomeScreen', 'true');
      }
      setLoading(false);
    };

    checkFirstLaunch();
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <>
            <Stack.Screen name="Introduction" component={IntroductionScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Main" component={Main} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
