import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { StripeProvider } from '@stripe/stripe-react-native';


import { UserProvider } from './src/components/UserContext';
import { SessionManager } from './src/components/SessionManager';

import HomeScreen from './src/components/HomeScreenFlow/HomeScreen';
import ClustersScreen from './src/components/HomeScreenFlow/ClustersScreen';
import FlashDropScreen from './src/components/HomeScreenFlow/FlashDropScreen';

import WriteReviewScreen from './src/components/HomeScreenFlow/WriteReviewScreen';
import ExploreScreen from './src/components/HomeScreenFlow/ExploreScreen';
import UploadScreen from './src/components/HomeScreenFlow/UploadScreen';
import RewardsScreen from './src/components/HomeScreenFlow/Rewards/RewardsScreen';
import ProfileScreen from './src/components/HomeScreenFlow/Profile_Information/ProfileScreen';
import SignUpScreen from './src/components/SignupFlow/SignUpScreen';
import BillInsightQuestions from './src/components/HomeScreenFlow/SwapBills/BillInsightQuestions';
import BillSummaryPreview from './src/components/HomeScreenFlow/SwapBills/BillSummaryPreview';
import InsightReport from './src/components/HomeScreenFlow/SwapBills/InsightReport';
import StaticPage from './src/components/HomeScreenFlow/StaticPage';


import StarterBill from './src/components/HomeScreenFlow/StarterBill';
import ConfirmBill from './src/components/HomeScreenFlow/SwapBills/ConfirmBill';
import MyContributions from './src/components/HomeScreenFlow/User_Buttons/MyContributions';
import MyCompleted from './src/components/HomeScreenFlow/User_Buttons/MyCompleted';
import Active from './src/components/HomeScreenFlow/User_Buttons/Active';
import BillSharesScreen from './src/components/BillSharesScreen';
import StartSwap from './src/components/HomeScreenFlow/SwapBills/StartSwap';
import OptionalPayments from './src/components/HomeScreenFlow/SwapBills/OptionalPayments';
import MatchResults from './src/components/HomeScreenFlow/SwapBills/MatchResults';
import FindMatches from './src/components/HomeScreenFlow/SwapBills/FindMatches';

import CustomTabBar from './src/components/HomeScreenFlow/AppLayout/CustomTabBar';
import LoginScreen from './src/components/HomeScreenFlow/AppLayout/LoginScreen';
import TermsScreen from './src/components/HomeScreenFlow/Profile_Information/TermsScreen';
import ResetPasswordScreen from './src/components/HomeScreenFlow/Profile_Information/ResetPasswordScreen';


import ChatScreen from './src/components/HomeScreenFlow/User_Buttons/ChatScreen';
import ChatListScreen from './src/components/HomeScreenFlow/User_Buttons/ChatListScreen';
import FAQScreen from './src/components/HomeScreenFlow/User_Buttons/FAQScreen';
import FundingScreen from './src/components/HomeScreenFlow/User_Buttons/FundingScreen';
import DailyVoteScreen from './src/components/HomeScreenFlow/User_Buttons/DailyVoteScreen';

import HelpScreen from './src/components/HomeScreenFlow/Profile_Information/HelpScreen';
import AccountControlsScreen from './src/components/HomeScreenFlow/Profile_Information/AccountControlsScreen';
import TrustScoreScreen from './src/components/HomeScreenFlow/Profile_Information/TrustScoreScreen';
import Wheels from './src/components/Wheels';

import CoPilotRequest from './src/components/HomeScreenFlow/SwapBills/CoPilotRequest';

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
      <SessionManager>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StarterBill" component={StarterBill} options={{ headerShown: false }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="WriteReviewScreen" component={WriteReviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClustersScreen" component={ClustersScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FlashDropScreen" component={FlashDropScreen} options={{ headerShown: false }} />


          <Stack.Screen name="StartSwap" component={StartSwap} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ headerShown: false }} />

          <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FundingScreen" component={FundingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DailyVoteScreen" component={DailyVoteScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmBill" component={ConfirmBill} options={{ headerShown: false }} />
          <Stack.Screen name="OptionalPayments" component={OptionalPayments} options={{ headerShown: false }} />
          <Stack.Screen name="MatchResults" component={MatchResults} options={{ headerShown: false }} />
          <Stack.Screen name="Active" component={Active} options={{ headerShown: false }} />
          <Stack.Screen name="MyCompleted" component={MyCompleted} options={{ headerShown: false }} />
          <Stack.Screen name="BillSharesScreen" component={BillSharesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BillInsightQuestions" component={BillInsightQuestions} options={{ headerShown: false }} />
          <Stack.Screen name="BillSummaryPreview" component={BillSummaryPreview} options={{ headerShown: false }} />
          <Stack.Screen name="InsightReport" component={InsightReport} options={{ headerShown: false }} />

          <Stack.Screen name="FindMatches" component={FindMatches} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AccountControlsScreen" component={AccountControlsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TrustScoreScreen" component={TrustScoreScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyContributions" component={MyContributions} options={{ headerShown: false }} />
          <Stack.Screen name="Wheels" component={Wheels} options={{ headerShown: false }} />
          <Stack.Screen name="CoPilotRequest" component={CoPilotRequest} options={{ headerShown: false }} />
          <Stack.Screen name="StaticPage" component={StaticPage} options={{ headerShown: false }} />

        </Stack.Navigator>
        </SessionManager>
      </NavigationContainer>

    </UserProvider>
    </StripeProvider>

  );
};

export default App;
