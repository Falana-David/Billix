// SessionManager.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import {
  AppState,
  Alert,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from './UserContext';

const AUTO_LOGOUT_TIME = 14 * 60 * 1000; // 14 minutes
const WARNING_TIME = 60 * 1000; // 1 minute

// const AUTO_LOGOUT_TIME = 10 * 1000; // 10 seconds
// const WARNING_TIME = 5 * 1000; // 5 seconds

export const SessionManager = ({ children }) => {
  const navigation = useNavigation();
  const { logout } = useContext(UserContext);

  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isLoggingOut = useRef(false);

  const resetTimers = () => {
    console.log('🔁 Resetting timers');
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
  
    if (isLoggingOut.current) {
      console.log('⚠️ Already logging out, skipping timer reset');
      return;
    }
  
    warningTimeoutRef.current = setTimeout(() => {
      if (!isLoggingOut.current) {
        console.log('⚠️ Showing warning alert');
        Alert.alert(
          'Inactivity Warning',
          'You will be logged out in a few seconds due to inactivity.',
          [
            {
              text: 'Stay Logged In',
              onPress: () => {
                console.log('🔄 User tapped Stay Logged In');
                resetTimers();
              },
            },
          ]
        );
      }
    }, AUTO_LOGOUT_TIME);
  
    timeoutRef.current = setTimeout(() => {
      console.log('🚪 Logging out now');
      isLoggingOut.current = true;
      logout(navigation);
    }, AUTO_LOGOUT_TIME + WARNING_TIME);
  };
  
  

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimers();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    console.log('🟢 SessionManager mounted');
    isLoggingOut.current = false; 
    resetTimers();
  
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        resetTimers();
      }
      appState.current = nextState;
    });
  
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      subscription.remove();
    };
  }, []);
  

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        resetTimers();
        Keyboard.dismiss();
      }}
    >
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};
