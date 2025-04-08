import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Animated } from 'react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [animations, setAnimations] = useState(
    state.routes.map(() => new Animated.Value(1))
  );

  // Define page background colors for each route
  const pageBackgroundColors = {
    Home: '#F0F8EC',       // Light green for Home
    Explore: '#f2f6f9',    // Light gray for Explore
    Upload: '#F0F8EC',     // Light yellow for Upload
    Rewards: '#F08080',    // Light gold for Rewards
    Profile: '#F0F8EC',    // Light pink for Profile
  };

  // Define tab bar background colors for each route
  const tabBarBackgroundColors = {
    Home: '#4A7C59',       // Slightly darker green for Home
    Explore: '#3b5998',    // Slightly darker gray for Explore
    Upload: '#4A7C59',     // Slightly darker yellow for Upload
    Rewards: '#CD5C5C',    // Slightly darker gold for Rewards
    Profile: '#4A7C59',    // Slightly darker pink for Profile
  };

  // Get the current route name
  const currentRouteName = state.routes[state.index].name;

  // Determine the background color for the page and tab bar based on the current route
  const currentPageBackgroundColor = pageBackgroundColors[currentRouteName] || '#D4E7D0';
  const currentTabBarBackgroundColor = tabBarBackgroundColors[currentRouteName] || '#B3CBB9';

  const handlePressIn = (index) => {
    Animated.timing(animations[index], {
      toValue: 0.5,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.timing(animations[index], {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.tabBarContainer, { backgroundColor: currentPageBackgroundColor }]}>
      <View style={[styles.tabBar, { backgroundColor: currentTabBarBackgroundColor }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const iconName = route.name === 'Home' ? require('./assets/home.png') :
                           route.name === 'Explore' ? require('./assets/explore.png') :
                           route.name === 'Upload' ? require('./assets/upload.png') :
                           route.name === 'Rewards' ? require('./assets/rewards.png') :
                           route.name === 'Profile' ? require('./assets/profile.png') :
                           require('./assets/home.png');

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Animated.View style={{ opacity: animations[index], transform: [{ scale: animations[index] }] }}>
                <Image
                  source={iconName}
                  style={[
                    styles.icon,
                    { tintColor: isFocused ? '#FFE4B5' : '#ffffff' },
                  ]}
                />
                {route.name !== 'Upload' && (
                  <Text style={[styles.label, { color: '#ffffff' }]}>
                    {route.name}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    marginBottom: 0, // Move the navbar up
    // Background color will be dynamically set based on the current route
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 5,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default CustomTabBar;
