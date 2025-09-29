// screens/FlashDropScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.select({
  ios: 'http://127.0.0.1:5000',
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

const sep = (n) => (n == null ? '-' : Number(n).toLocaleString());

export default function FlashDropScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [drop, setDrop] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [err, setErr] = useState('');

  // Fetch the active drop
  const fetchDrop = async () => {
    try {
      setErr('');
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/flashdrop/current`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 204) { setDrop(null); return; }
      if (!res.ok) throw new Error('flashdrop');
      const data = await res.json();
      setDrop(data);
    } catch (e) {
      setErr('Unable to load Flash Drop.');
      setDrop(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrop(); }, []);

  // Countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remainingMs = useMemo(() => {
    if (!drop?.endsAt) return 0;
    return Math.max(0, new Date(drop.endsAt).getTime() - now);
  }, [drop, now]);
  const mm = String(Math.floor(remainingMs / 1000 / 60)).padStart(2, '0');
  const ss = String(Math.floor((remainingMs / 1000) % 60)).padStart(2, '0');

  const soldOut = (drop?.remaining ?? 0) <= 0;
  const expired = remainingMs <= 0;

  const handleClaim = async () => {
    try {
      if (!drop) return;
      setClaiming(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/flashdrop/${drop.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      if (res.status === 409) { Alert.alert('Sorry', 'Sold out.'); await fetchDrop(); return; }
      if (res.status === 403) { Alert.alert('Not eligible', 'Phone verification or limits not met.'); return; }
      if (!res.ok) throw new Error('claim');
      const data = await res.json();
      // You can use data.redemption, data.instructions, data.credit_awarded, etc.
      Alert.alert('Claimed!', data.message || 'Your spot is locked. Check SMS for details.');
      await fetchDrop();
    } catch (e) {
      Alert.alert('Error', 'Could not claim right now.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F5E9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>⚡ Flash Drop</Text>
        {loading ? (
          <View style={styles.card}><ActivityIndicator /><Text style={styles.muted}>Loading...</Text></View>
        ) : err ? (
          <View style={styles.card}><Text style={styles.err}>{err}</Text></View>
        ) : !drop ? (
          <View style={styles.card}><Text style={styles.muted}>No active drops right now. Enable Alerts to catch the next one.</Text></View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{drop.title}</Text>
            <Text style={styles.sub}>{drop.subtitle}</Text>

            <View style={styles.row}>
              <View style={styles.kpi}><Text style={styles.kpiVal}>{drop.provider}</Text><Text style={styles.kpiLab}>Provider</Text></View>
              <View style={styles.kpi}><Text style={styles.kpiVal}>{drop.region}</Text><Text style={styles.kpiLab}>Region</Text></View>
            </View>

            <View style={styles.row}>
              <View style={styles.kpi}><Text style={styles.kpiVal}>${sep(drop.localLow)}</Text><Text style={styles.kpiLab}>Local Low</Text></View>
              <View style={styles.kpi}><Text style={styles.kpiVal}>{drop.remaining}/{drop.slots}</Text><Text style={styles.kpiLab}>Slots Left</Text></View>
            </View>

            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Time Left</Text>
              <Text style={styles.timer}>{mm}:{ss}</Text>
            </View>

            <Text style={styles.note}>{drop.note}</Text>

            <TouchableOpacity
              disabled={soldOut || expired || claiming}
              onPress={handleClaim}
              style={[
                styles.primaryBtn,
                { backgroundColor: soldOut || expired ? '#9BB9A9' : '#2E7D32' }
              ]}>
              <Text style={styles.primaryText}>{soldOut ? 'Sold Out' : expired ? 'Expired' : (claiming ? 'Claiming…' : 'Claim Spot')}</Text>
            </TouchableOpacity>

            {drop.preview && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>What you get</Text>
                {drop.preview.map((line, i) => (<Text key={i} style={styles.previewItem}>• {line}</Text>))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16 },
  h1:{ fontSize:24, fontWeight:'900', marginBottom:8 },
  card:{ backgroundColor:'#FFF', borderRadius:18, padding:16, borderWidth:1, borderColor:'#DDEDE2' },
  title:{ fontSize:18, fontWeight:'900' },
  sub:{ marginTop:4, color:'#4A7C59' },
  row:{ flexDirection:'row', gap:10, marginTop:12 },
  kpi:{ flex:1, borderWidth:1, borderColor:'#DDEDE2', borderRadius:12, padding:12, alignItems:'center' },
  kpiVal:{ fontWeight:'900' },
  kpiLab:{ color:'#6E8F7A', marginTop:2 },
  timerBox:{ marginTop:12, alignItems:'center' },
  timerLabel:{ color:'#6E8F7A' },
  timer:{ fontSize:36, fontWeight:'900', letterSpacing:1 },
  note:{ marginTop:10, color:'#0B1C15' },
  primaryBtn:{ marginTop:14, borderRadius:12, paddingVertical:12, alignItems:'center' },
  primaryText:{ color:'#fff', fontWeight:'900' },
  preview:{ marginTop:14, backgroundColor:'#F7FBF8', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E4EFE7' },
  previewTitle:{ fontWeight:'800', marginBottom:6 },
  previewItem:{ color:'#0B1C15' },
  muted:{ color:'#6E8F7A' },
  err:{ color:'#B95000', fontWeight:'800' }
});
