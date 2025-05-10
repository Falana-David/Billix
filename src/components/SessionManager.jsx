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

export const SessionManager = ({ children }) => {
  const navigation = useNavigation();
  const { logout } = useContext(UserContext);

  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isLoggingOut = useRef(false);

  const resetTimers = () => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    isLoggingOut.current = false;

    // Schedule warning before logout
    warningTimeoutRef.current = setTimeout(() => {
      if (!isLoggingOut.current) {
        Alert.alert(
          'Inactivity Warning',
          'You will be logged out in 1 minute due to inactivity.',
          [{ text: 'Stay Logged In', onPress: resetTimers }]
        );
      }
    }, AUTO_LOGOUT_TIME);

    // Schedule auto logout
    timeoutRef.current = setTimeout(() => {
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
    // Handle app state (foreground/background)
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        resetTimers();
      }
      appState.current = nextState;
    });

    // Initial start
    resetTimers();

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
