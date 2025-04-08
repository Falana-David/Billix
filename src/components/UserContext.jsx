import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Context for the user
export const UserContext = createContext();

// Create a Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const tokenData = await AsyncStorage.getItem('tokenData');
        if (tokenData) {
          const { token, expirationTime, firstName, profilePicture } = JSON.parse(tokenData);
          if (Date.now() < expirationTime) {
            setUser({ token, firstName, profilePicture });
          } else {
            await logout(); // Automatically log out if the token is expired
          }
        }
      } catch (error) {
        console.error('Failed to load user data from AsyncStorage:', error);
      }
    };

    loadUserData();
  }, []);

  const login = async (token, firstName, profilePicture, expiresIn) => {
    try {
      const expirationTime = Date.now() + expiresIn * 1000; // expiresIn is assumed to be in seconds
      const tokenData = JSON.stringify({ token, expirationTime, firstName, profilePicture });
      await AsyncStorage.setItem('tokenData', tokenData);
      setUser({ token, firstName, profilePicture });
    } catch (error) {
      console.error('Failed to save user data to AsyncStorage:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('tokenData');
    } catch (error) {
      console.error('Failed to clear user data from AsyncStorage:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
