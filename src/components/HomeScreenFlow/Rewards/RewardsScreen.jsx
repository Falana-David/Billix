// BillHealthScreen.jsx — JSX version (no TypeScript)
// Drop-in screen that visualizes community (ZIP) and state bill health with fake data.

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ---------------- Theme ---------------- */
const COLORS = {
  appBg: '#E6F5E9',
  surface: '#FFFFFF',
  border: '#DDEDE2',
  text: '#0B1C15',
  sub: '#4A7C59',
  subMuted: '#6E8F7A',
  good: '#1F8A6E',
  warn: '#B95000',
  bad: '#B3261E',
  soft: '#F7FBF8',
  soft2: '#ECF6F0',
};
const RADII = { sm: 10, md: 14, lg: 18, pill: 999 };
const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

/** --------------- Fake data --------------- */
const COMMUNITIES = [
  {
    key: '10027',
    name: 'Morningside Heights',
    cityState: 'New York, NY',
    state: 'NY',
    score: 78, // 0–100
    peersOnline: 34,
    communitySize: 482,
    uploads7d: 63,
    flashes7d: 4,
    volatility: 0.18, // 0–1
    outlierRate: 0.12, // 0–1
    avgDiscount: 0.11, // 0–1
    trend7: [101, 98, 97, 95, 96, 92, 89], // local median sample
    providers: [
      { name: 'Verizon', category: 'Internet', median: 92, regional: 98, low90d: 82, drops30d: 2 },
      { name: 'Spectrum', category: 'Internet', median: 95, regional: 99, low90d: 84, drops30d: 1 },
      { name: 'Con Edison', category: 'Electric', median: 108, regional: 111, low90d: 96, drops30d: 0 },
    ],
  },
  {
    key: '11201',
    name: 'Brooklyn Heights',
    cityState: 'Brooklyn, NY',
    state: 'NY',
    score: 70,
    peersOnline: 21,
    communitySize: 356,
    uploads7d: 44,
    flashes7d: 3,
    volatility: 0.22,
    outlierRate: 0.15,
    avgDiscount: 0.09,
    trend7: [104, 103, 101, 99, 97, 96, 94],
    providers: [
      { name: 'Spectrum', category: 'Internet', median: 97, regional: 99, low90d: 86, drops30d: 2 },
      { name: 'Verizon', category: 'Internet', median: 94, regional: 98, low90d: 83, drops30d: 1 },
      { name: 'National Grid', category: 'Gas', median: 78, regional: 81, low90d: 69, drops30d: 0 },
    ],
  },
];

const STATE_SNAPSHOT = {
  NY: {
    score: 74,
    uploads30d: 1298,
    outlierRate: 0.14,
    volatility: 0.19,
    medianAll: 101,
    trend7: [103, 102, 101, 101, 100, 99, 98],
  },
};

/** --------------- Helpers --------------- */
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const scoreColor = (s) => (s >= 80 ? COLORS.good : s >= 60 ? '#7BAA5C' : s >= 45 ? COLORS.warn : COLORS.bad);
const scoreLabel = (s) => (s >= 80 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Fair' : 'Watch');
const pct = (n) => `${Math.round(n * 100)}%`;
const sep = (n) => n.toLocaleString();
const last = (arr) => (arr && arr.length ? arr[arr.length - 1] : undefined);

/** --------------- Tiny sparkline (bars) --------------- */
const Sparkline = ({ points = [1, 2, 3, 2, 4, 3, 5] }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
  return (
    <View style={styles.sparkWrap}>
      {points.map((v, i) => (
        <View key={i} style={[styles.sparkBar, { height: 10 + 22 * norm(v) }]} />
      ))}
    </View>
  );
};

/** --------------- Small UI primitives --------------- */
const KPI = ({ label, value }) => (
  <View style={styles.kpiItem}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{String(value)}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const Driver = ({ label, value, invert = false, good = false }) => {
  // invert=true → lower is better; good=true → higher is better
  const v = clamp01(value);
  const pos = invert ? 1 - v : v;
  const barColor = good
    ? COLORS.good
    : invert
    ? v < 0.4
      ? COLORS.good
      : v < 0.7
      ? '#7BAA5C'
      : COLORS.warn
    : v > 0.6
    ? COLORS.good
    : v > 0.4
    ? '#7BAA5C'
    : COLORS.warn;

  return (
    <View style={styles.driverRow}>
      <Text style={styles.driverLabel}>{label}</Text>
      <View style={styles.progressOuter}>
        <View style={[styles.progressInner, { width: `${Math.round(pos * 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.driverPct}>{pct(value)}</Text>
    </View>
  );
};

/** --------------- Main Screen --------------- */
export default function BillHealthScreen() {
  const [selectedKey, setSelectedKey] = useState('10027');
  const [refreshing, setRefreshing] = useState(false);

  const community = useMemo(
    () => COMMUNITIES.find((c) => c.key === selectedKey) || COMMUNITIES[0],
    [selectedKey]
  );
  const stateView = STATE_SNAPSHOT[community.state];

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('bh_selected_zip');
      if (saved && COMMUNITIES.some((c) => c.key === saved)) setSelectedKey(saved);
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('bh_selected_zip', selectedKey);
  }, [selectedKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 650)); // pleasant fake refresh
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS.appBg }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Bill Health</Text>
          <View style={styles.locationPills}>
            {COMMUNITIES.map((c) => {
              const active = c.key === selectedKey;
              return (
                <TouchableOpacity key={c.key} onPress={() => setSelectedKey(c.key)} style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{c.key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Community card */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{community.name} · {community.key}</Text>
              <Text style={styles.cardSub}>{community.cityState}</Text>
            </View>
            <View style={styles.scoreWrap}>
              <Progress.Circle
                size={74}
                progress={community.score / 100}
                thickness={8}
                color={scoreColor(community.score)}
                unfilledColor="#E6F1EA"
                borderWidth={0}
                showsText
                formatText={() => String(community.score)}
                textStyle={{ fontWeight: '900', color: COLORS.text }}
              />
              <Text style={[styles.scoreLabel, { color: scoreColor(community.score) }]}>{scoreLabel(community.score)}</Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <KPI label="Peers online" value={sep(community.peersOnline)} />
            <Divider />
            <KPI label="In community" value={sep(community.communitySize)} />
            <Divider />
            <KPI label="Uploads (7d)" value={sep(community.uploads7d)} />
          </View>

          {/* Drivers */}
          <Text style={styles.sectionHint}>What drives this score</Text>
          <Driver label="Avg discount potential" value={community.avgDiscount} good />
          <Driver label="Volatility" value={community.volatility} invert />
          <Driver label="Outlier / fee rate" value={community.outlierRate} invert />

          <View style={styles.rowSpace}>
            <View style={styles.inlineCard}>
              <Text style={styles.inlineTitle}>Local Median</Text>
              <Sparkline points={community.trend7} />
              <Text style={styles.inlineValue}>${last(community.trend7)}</Text>
              <Text style={styles.inlineSub}>7-day view</Text>
            </View>
            <View style={styles.inlineCard}>
              <Text style={styles.inlineTitle}>Flash Drops</Text>
              <Text style={[styles.inlineValue, { color: COLORS.good }]}>{community.flashes7d}</Text>
              <Text style={styles.inlineSub}>Seen in last 7 days</Text>
              <TouchableOpacity style={[styles.btnTiny, { backgroundColor: COLORS.good }]}>
                <Text style={styles.btnTinyText}>Enable alerts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* State snapshot */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>State health · {community.state}</Text>
            <Text style={[styles.badge, { color: scoreColor(stateView.score), borderColor: scoreColor(stateView.score) }]}>
              {stateView.score} · {scoreLabel(stateView.score)}
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <KPI label="Median bill" value={`$${stateView.medianAll}`} />
            <Divider />
            <KPI label="Uploads (30d)" value={sep(stateView.uploads30d)} />
            <Divider />
            <KPI label="Outlier rate" value={pct(stateView.outlierRate)} />
          </View>

          <Driver label="State volatility" value={stateView.volatility} invert />
          <View style={{ marginTop: 8 }}>
            <Text style={styles.sectionHint}>State trend (7-day)</Text>
            <Sparkline points={stateView.trend7} />
          </View>
        </View>

        {/* Providers */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Providers in your community</Text>
          </View>

        {community.providers.map((p) => (
          <View key={p.name} style={styles.providerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{p.name}</Text>
              <Text style={styles.providerMeta}>{p.category}</Text>
            </View>
            <View style={styles.providerStats}>
              <Text style={styles.providerStat}><Text style={styles.statLabel}>Median</Text> ${p.median}</Text>
              <Text style={styles.providerStat}><Text style={styles.statLabel}>Regional</Text> ${p.regional}</Text>
              <Text style={styles.providerStat}><Text style={styles.statLabel}>Low (90d)</Text> ${p.low90d}</Text>
            </View>
            <View style={{ width: 80, alignItems: 'flex-end' }}>
              <Text style={[styles.dropPill, { backgroundColor: p.drops30d ? COLORS.soft2 : COLORS.soft, borderColor: COLORS.border }]}>
                {p.drops30d ? `${p.drops30d} drops` : '—'}
              </Text>
            </View>
          </View>
        ))}
        </View>

        {/* Recent signals */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Recent signals</Text>
            <TouchableOpacity><Text style={styles.link}>See market</Text></TouchableOpacity>
          </View>
          {[
            { t: `Flash drop hit $${(last(community.trend7) || 0) - 7} for Internet`, c: COLORS.good },
            { t: 'Fee outliers up 2% week-over-week', c: COLORS.warn },
            { t: 'Electric median eased $3 this week', c: COLORS.sub },
          ].map((e) => (
            <View key={e.t} style={styles.signalRow}>
              <View style={[styles.signalDot, { backgroundColor: e.c }]} />
              <Text style={styles.signalText}>{e.t}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.rowSpace}>
          <TouchableOpacity style={[styles.cta, { backgroundColor: COLORS.good }]}>
            <Text style={styles.ctaText}>Upload a bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cta, { backgroundColor: COLORS.sub }]}>
            <Text style={styles.ctaText}>Join a cluster</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8 },

  headerRow: { marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
  locationPills: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADII.pill },
  pillActive: { backgroundColor: COLORS.soft, borderColor: '#CFE6D8' },
  pillText: { color: COLORS.subMuted, fontWeight: '800' },
  pillTextActive: { color: COLORS.text },

  card: { backgroundColor: COLORS.surface, borderRadius: RADII.lg, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  cardSub: { color: COLORS.subMuted, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderRadius: RADII.pill, fontWeight: '900' },

  scoreWrap: { alignItems: 'center' },
  scoreLabel: { marginTop: 6, fontWeight: '800' },

  kpiRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: COLORS.soft, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border, marginTop: 8 },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiLabel: { color: COLORS.subMuted, fontSize: 12, fontWeight: '700' },
  kpiValue: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginTop: 2 },
  divider: { width: 1, height: 26, backgroundColor: COLORS.border },

  sectionHint: { color: COLORS.subMuted, fontWeight: '800', marginTop: 10, marginBottom: 8, fontSize: 12 },

  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  driverLabel: { color: COLORS.text, fontWeight: '700', width: 180 },
  driverPct: { color: COLORS.subMuted, width: 48, textAlign: 'right', fontWeight: '800' },
  progressOuter: { flex: 1, height: 10, backgroundColor: '#E6F1EA', borderRadius: 999, overflow: 'hidden', marginLeft: 10 },
  progressInner: { height: '100%' },

  rowSpace: { flexDirection: 'row', gap: 12, marginTop: 10 },
  inlineCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.soft, borderRadius: RADII.md, padding: 12 },
  inlineTitle: { color: COLORS.subMuted, fontWeight: '800', fontSize: 12 },
  inlineValue: { color: COLORS.text, fontSize: 20, fontWeight: '900', marginTop: 8 },
  inlineSub: { color: COLORS.subMuted, marginTop: 2 },
  btnTiny: { marginTop: 10, paddingVertical: 8, borderRadius: RADII.md, alignItems: 'center' },
  btnTinyText: { color: '#fff', fontWeight: '900' },

  providerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  providerName: { color: COLORS.text, fontWeight: '800' },
  providerMeta: { color: COLORS.subMuted, marginTop: 2 },
  providerStats: { flexDirection: 'column', gap: 2, marginLeft: 16, minWidth: 170 },
  providerStat: { color: COLORS.text, fontWeight: '700' },
  statLabel: { color: COLORS.subMuted, fontWeight: '800' },
  dropPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADII.pill, borderWidth: 1, overflow: 'hidden', color: COLORS.text, fontWeight: '800', textAlign: 'center' },

  link: { color: COLORS.sub, fontWeight: '800' },

  signalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  signalDot: { width: 8, height: 8, borderRadius: 4 },
  signalText: { color: COLORS.text, fontWeight: '700', flex: 1 },

  cta: { flex: 1, paddingVertical: 14, borderRadius: RADII.md, alignItems: 'center', ...SHADOW },
  ctaText: { color: '#fff', fontWeight: '900' },

  // sparkline
  sparkWrap: { flexDirection: 'row', gap: 2, marginTop: 8 },
  sparkBar: { width: 10, backgroundColor: COLORS.sub, borderRadius: 4 },
});
