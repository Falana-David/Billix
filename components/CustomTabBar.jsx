import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <SafeAreaView style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const iconName = route.name === 'Home' ? require('../assests/home.png') :
                         route.name === 'Explore' ? require('../assests/explore.png') :
                         route.name === 'Upload' ? require('../assests/upload.png') :
                         route.name === 'Rewards' ? require('../assests/rewards.png') :
                         route.name === 'Profile' ? require('../assests/profile.png') :
                         require('../assests/home.png');

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
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Image
              source={iconName}
              style={[
                styles.icon,
                { tintColor: isFocused ? '#4682B4' : 'white' },
                route.name === 'Upload' ? styles.uploadIcon : styles.defaultIcon,
              ]}
            />
            {route.name !== 'Upload' && (
              <Text style={[styles.label, { color: isFocused ? '#4682B4' : 'white' }]}>
                {route.name}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#5fa052',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  icon: {
    width: 24,
    height: 24,
  },
  uploadIcon: {
    width: 30,
    height: 30,
    marginBottom: 5, // Adjust margin to position the Upload icon higher
  },
  defaultIcon: {
    marginBottom: -25, // Adjust margin to position other icons lower
  },
  label: {
    fontSize: 12,
    marginTop: 24, // Adjust margin to lower the text
  //  height: 12, // Set fixed height for text to prevent shifting
  },
});

export default CustomTabBar;
