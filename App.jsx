import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { StripeProvider } from '@stripe/stripe-react-native';

import { UserProvider } from './src/components/UserContext';
import HomeScreen from './src/components/HomeScreenFlow/HomeScreen';
import ExploreScreen from './src/components/ExploreScreen';
import UploadScreen from './src/components/UploadScreen';
import RewardsScreen from './src/components/RewardsScreen';
import ProfileScreen from './src/components/ProfileScreen';
import SignUpScreen from './src/components/SignupFlow/SignUpScreen';
import StarterBill from './src/components/HomeScreenFlow/StarterBill';

import LoginScreen from './src/components/LoginScreen';
import TermsScreen from './src/components/TermsScreen';
import WelcomeScreen from './src/components/WelcomeScreen';
import BillSwapScreen from './src/components/SwapBills/BillSwapScreen';
import BillInformationCollection from './src/components/SwapBills/BillInformationCollection';
import FindMatches from './src/components/SwapBills/FindMatches';
import MatchDetails from './src/components/SwapBills/MatchDetails';
import PaymentInformation from './src/components/SwapBills/PaymentInformation';
import StartSwap from './src/components/SwapBills/StartSwap';
import ConfirmationAndTracking from './src/components/SwapBills/ConfirmationAndTracking';

import CustomTabBar from './src/components/CustomTabBar';
import BillSwapSelection from './src/components/SwapBills/BillSwapSelection';
import SponsorSwapScreen from './src/components/SwapBills/SponsorSwapScreen';
import CommunityVotingScreen from './src/components/CommunityVotingScreen';
import PotentialSwapsScreen from './src/components/PotentialSwapsScreen';
import ResetPasswordScreen from './src/components/ResetPasswordScreen';
import EmergencyFundingRequestScreen from './src/components/EmergencyFundingRequestScreen'; // New import
import ConfirmationScreen from './src/components/ConfirmationScreen'; // New import
import ChatScreen from './src/components/ChatScreen';
import FAQScreen from './src/components/FAQScreen';
import FundingScreen from './src/components/FundingScreen';
import DailyVoteScreen from './src/components/DailyVoteScreen';
// import SplashScreen from './src/components/SplashScreen';

enableScreens();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Upload" component={UploadScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <StripeProvider
      publishableKey='pk_test_51RDIW7Rei024sC7gIuK3nV4GClnGaSM8e7b2nRvfM4LLygdrgXCvokxKRtEG17qRvFXypGJWfzBSnvUeaDuzLdqJ003K6knVr8'
      urlScheme="billix"  // ← required for iOS redirects
      merchantIdentifier="merchant.com.yourcompany.billix"  // ← for Apple Pay (optional but good)
  >
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StarterBill" component={StarterBill} options={{ headerShown: false }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="BillSwap" component={BillSwapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StartSwap" component={StartSwap} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FundingScreen" component={FundingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DailyVoteScreen" component={DailyVoteScreen} options={{ headerShown: false }} />

          <Stack.Screen name="BillSwapSelection" component={BillSwapSelection} options={{ headerShown: false }} />
          <Stack.Screen name="BillInformationCollection" component={BillInformationCollection} options={{ headerShown: false }} />
          <Stack.Screen name="FindMatches" component={FindMatches} options={{ headerShown: false }} />
          <Stack.Screen name="MatchDetails" component={MatchDetails} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentInformation" component={PaymentInformation} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmationAndTracking" component={ConfirmationAndTracking} options={{ headerShown: false }} />
          <Stack.Screen name="SponsorSwap" component={SponsorSwapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CommunityVoting" component={CommunityVotingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PotentialSwaps" component={PotentialSwapsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmergencyFundingRequest" component={EmergencyFundingRequestScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
    </StripeProvider>

  );
};

export default App;
