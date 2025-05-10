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
          const { id, token, expirationTime, firstName, profilePicture, trustScore } = JSON.parse(tokenData);
        if (Date.now() < expirationTime) {
          setUser({ id, token, firstName, profilePicture, trustScore });
        }
        else {
            await logout(); // Automatically log out if the token is expired
          }
        }
      } catch (error) {
        console.error('Failed to load user data from AsyncStorage:', error);
      }
    };

    loadUserData();
  }, []);

  const login = async (id, token, firstName, profilePicture, trustScore, expiresIn) => {
    try {
      const expirationTime = Date.now() + expiresIn * 1000;
      const tokenData = JSON.stringify({ id, token, expirationTime, firstName, profilePicture, trustScore });
      await AsyncStorage.setItem('tokenData', tokenData);
      setUser({ id, token, firstName, profilePicture, trustScore });
    } catch (error) {
      console.error('Failed to save user data to AsyncStorage:', error);
    }
  };
  

  const logout = async (navigation) => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('tokenData');
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
