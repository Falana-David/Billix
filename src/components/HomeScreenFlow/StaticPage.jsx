import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';

// If you colocate colors, import them instead. Duplicating minimal styles for simplicity.
const COLORS = {
  appBg: '#EAF6F0',
  surface: '#FFFFFF',
  text: '#0B1C15',
  textSubtle: '#5B6A61',
};

const StaticPage = ({ route }) => {
  const { title = 'Info', body = '' } = route.params || {};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.appBg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 18, padding: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 8 }}>{title}</Text>
          <Text style={{ color: COLORS.textSubtle, fontWeight: '600', lineHeight: 20 }}>{body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaticPage;
