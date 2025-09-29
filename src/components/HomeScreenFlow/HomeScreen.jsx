import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Linking,
  useColorScheme,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../UserContext';

/* ------------------------------- Config ---------------------------------- */
const BASE_URL = Platform.select({
  ios: 'http://127.0.0.1:5000',   // iOS simulator
  android: 'http://10.0.2.2:5000',// Android emulator
  default: 'http://localhost:5000',
});

/* -------------------------------- Theme ---------------------------------- */
const makePalette = (scheme) => {
  const isDark = scheme === 'dark';
  return {
    bg: isDark ? '#0E1713' : '#E6F5E9',
    card: isDark ? '#14221B' : '#FFFFFF',
    ink: isDark ? '#ECF3EF' : '#0B1C15',
    sub: isDark ? '#9FD8B8' : '#4A7C59',
    subMuted: isDark ? '#80A28E' : '#6E8F7A',
    border: isDark ? '#254331' : '#DDEDE2',
    accent: isDark ? '#7AD9A8' : '#2E7D32',
    warning: isDark ? '#F1A16E' : '#B95000',
    good: isDark ? '#6BE0B1' : '#0E8F62',
    tintSoft: isDark ? '#0F1C16' : '#F7FBF8',
  };
};
const sep = (n) => (n == null ? '-' : Number(n).toLocaleString());

/* ------------------------- API → UI Normalizers -------------------------- */
const normalizeProfile = (d = {}) => {
  const src = d.user ?? d.profile ?? d;
  const firstName = src.firstName ?? src.first_name ?? src.given_name ?? '';
  const lastName  = src.lastName  ?? src.last_name  ?? '';
  const trustScoreNum = Number(src.trustScore ?? src.trust_score);
  const badgeLevel = src.badgeLevel ?? src.badge_level;

  let profilePicture = src.profilePicture ?? src.profile_picture ?? null;
  if (profilePicture && typeof profilePicture === 'string' && !profilePicture.startsWith('http') && !profilePicture.startsWith('data:')) {
    profilePicture = `data:image/jpeg;base64${profilePicture.startsWith(',') ? '' : ','}${profilePicture}`;
  }
  return {
    id: src.id,
    firstName,
    lastName,
    email: src.email ?? '',
    trustScore: Number.isFinite(trustScoreNum) ? trustScoreNum : undefined,
    badgeLevel,
    profilePicture,
  };
};

// /api/market/listings → SpecCard data
const normalizeListing = (m) => ({
  id: `ml-${m.id}`,
  billId: m.bill_id ?? m.billId,                  // keep the originating bill id (for filtering)
  provider: m.provider,
  city: m.city || '—',
  state: m.state || '—',
  total: typeof m.amountDue === 'number'
    ? m.amountDue
    : Math.round(((m.amount_due_cents ?? 0) / 100) * 100) / 100,
  fees: m?.specs?.taxesFees ?? 0,
  verified: true,
});

// /api/my/bills → BillCard data
const normalizeMyBill = (b) => ({
  id: `b-${b.id}`,
  rawId: b.id,                                     // keep numeric id to compare with listing.bill_id
  provider: b.provider || b.service_provider || '—',
  type: b.bill_type_label || b.bill_type || 'Bill',
  total: typeof b.amount_due === 'number'
    ? b.amount_due
    : Math.round(((b.amount_cents ?? 0) / 100) * 100) / 100,
  delta: b.m2m_delta ?? 0,
});

/* -------------------------------- Screen --------------------------------- */
export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext) || { user: null };
  const scheme = useColorScheme?.() || 'light';
  const PALETTE = makePalette(scheme);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');

  // dynamic data
  const [market, setMarket] = useState([]);       // listings preview (excluding mine)
  const [myBills, setMyBills] = useState([]);     // user bills preview
  const [myBillIds, setMyBillIds] = useState(new Set()); // for filtering marketplace
  const [clusters, setClusters] = useState([]);   // follows [{ clusterId, label }]

  // local UX state
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [kpis, setKpis] = useState({ mySaves: 0, peers: 0, spotted: 0 });

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const safeUser = profile || (user ? normalizeProfile(user) : null) || {
    firstName: 'Guest',
    trustScore: 4.6,
    badgeLevel: 'Verified',
  };

  /* ------------------------------- Fetchers ------------------------------- */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErr('');
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('profile');
      const data = await res.json();
      setProfile(normalizeProfile(data));
    } catch (e) {
      setErr('Unable to refresh profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyBills = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/my/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('bills');
      const arr = await res.json();
      const norm = arr.slice(0, 6).map(normalizeMyBill);
      setMyBills(norm);
      setMyBillIds(new Set(arr.map((b) => b.id))); // for marketplace filtering
    } catch (e) {
      setMyBills([]);
      setMyBillIds(new Set());
      // optional: setErr('Unable to load your bills');
    }
  }, []);

  // Marketplace — exclude my own bills (bill_id ∉ myBillIds). Also send excludeMine=1 if backend supports it.
  const fetchMarket = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // optional
      const res = await fetch(
        `${BASE_URL}/api/market/listings?excludeMine=1`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (!res.ok) throw new Error('market');
      const arr = await res.json();
      const mapped = arr.map(normalizeListing);
      const filtered = mapped.filter((m) => !m.billId || !myBillIds.has(m.billId));
      setMarket(filtered.slice(0, 10));
    } catch (e) {
      setMarket([]);
    }
  }, [myBillIds]);

  // Your Clusters — show real follows
  const fetchClusterFollows = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { setClusters([]); return; }
      const res = await fetch(`${BASE_URL}/api/market/follows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('follows');
      const arr = await res.json(); // expect [{ clusterId, label }]
      // Normalize minimal shape
      const norm = (arr || []).map((c) => ({
        clusterId: c.clusterId || c.id || c.cluster_id,
        label: c.label || `${c.provider ?? ''} · ${c.state ?? ''}${c.service ? ` · ${c.service}` : ''}`,
      })).filter((c) => c.clusterId && c.label);
      setClusters(norm);
    } catch {
      setClusters([]);
    }
  }, []);

  /* ------------------------------- Effects -------------------------------- */
  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem('home_kpis');
      if (cached) setKpis(JSON.parse(cached));
      if (!cached) {
        const seed = { mySaves: 2, peers: 18, spotted: 42 };
        setKpis(seed);
        await AsyncStorage.setItem('home_kpis', JSON.stringify(seed));
      }
    })();
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Fetch my bills first (to populate myBillIds), then fetch market so we can filter
  useEffect(() => { fetchMyBills(); }, [fetchMyBills]);
  useEffect(() => { fetchMarket(); }, [fetchMarket]);

  // Keep Your Clusters fresh when this screen is focused (after following on Clusters screen)
  useFocusEffect(
    useCallback(() => {
      fetchClusterFollows();
    }, [fetchClusterFollows])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchMyBills();   // updates myBillIds
    await fetchMarket();    // refilters with latest myBillIds
    await fetchClusterFollows();
    setRefreshing(false);
  }, [fetchProfile, fetchMyBills, fetchMarket, fetchClusterFollows]);

  /* --------------------------- Animated primitives ------------------------- */
  const Animated = require('react-native').Animated;
  const CountUp = ({ value = 0, duration = 900, style }) => {
    const anim = React.useRef(new Animated.Value(0)).current;
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      anim.stopAnimation();
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration, useNativeDriver: false }).start();
    }, [value]);
    useEffect(() => {
      const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v * Number(value))));
      return () => anim.removeListener(id);
    }, [value]);
    return <Text style={style}>{display.toLocaleString()}</Text>;
  };

  const ProgressBar = ({ progress = 0.4 }) => {
    const anim = React.useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(anim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
    }, [progress]);
    const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    return (
      <View style={styles.progressOuter}>
        <Animated.View style={[styles.progressInner, { width }]} />
      </View>
    );
  };

  const Sparkline = ({ points = [120,110,115,112,118,116,119] }) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
    return (
      <View style={styles.sparkWrap}>
        {points.map((v, i) => (
          <View key={i} style={[styles.sparkBar, { height: 8 + 22 * norm(v) }]} />
        ))}
      </View>
    );
  };

  /* ------------------------------ UI subviews ------------------------------ */
  const QuickAction = ({ label, sublabel, onPress, testID, icon }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={onPress}
      style={[styles.actionCard, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.actionLabel, { color: PALETTE.ink }]}>{label}</Text>
        {sublabel ? <Text style={[styles.actionSublabel, { color: PALETTE.subMuted }]}>{sublabel}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  const BillCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('InsightReport', { provider: item.provider })}
      style={[styles.billCard, { borderColor: PALETTE.border, backgroundColor: PALETTE.tintSoft }]}
      accessibilityRole="button"
      accessibilityLabel={`Open insights for ${item.provider}`}
    >
      <View style={styles.billHeaderRow}>
        <View style={styles.circleIcon} />
        <Text style={[styles.billProvider, { color: PALETTE.ink }]}>{item.provider}</Text>
      </View>
      <Text style={[styles.billType, { color: PALETTE.subMuted }]}>{item.type}</Text>
      <View style={styles.billRowBottom}>
        <Text style={[styles.billTotal, { color: PALETTE.ink }]}>${sep(item.total)}</Text>
        <View style={styles.deltaPill}>
          <Text style={[styles.deltaText, { color: item.delta > 0 ? '#B3261E' : PALETTE.good }]}>
            {item.delta > 0 ? `+${sep(item.delta)}` : sep(item.delta)}
          </Text>
        </View>
      </View>
      <Sparkline />
    </TouchableOpacity>
  );

  const SpecCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MarketplaceDetail', { id: item.id })}
      style={[styles.specCard, { borderColor: PALETTE.border, backgroundColor: PALETTE.tintSoft }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.provider} in ${item.city}, ${item.state}`}
    >
      <View style={styles.specHeader}>
        <View style={styles.squareIcon} />
        <Text style={[styles.specProvider, { color: PALETTE.ink }]} numberOfLines={1}>{item.provider}</Text>
        {item.verified && <Text style={[styles.verifiedPill, { backgroundColor: '#EAF6EF', color: PALETTE.accent }]}>Verified</Text>}
      </View>
      <Text style={[styles.specMeta, { color: PALETTE.subMuted }]}>{item.city}, {item.state}</Text>
      <Text style={[styles.specTotal, { color: PALETTE.ink }]}>${sep(item.total)}</Text>
      <Text style={[styles.specFees, { color: PALETTE.subMuted }]}>{item.fees} fees</Text>
    </TouchableOpacity>
  );

  const Announcement = () => (
    <View style={[styles.announceCard, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
      <View style={[styles.announceBadge, { backgroundColor: PALETTE.accent }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.announceTitle, { color: PALETTE.ink }]}>
          Flash Drop · Internet · Near You
        </Text>
        <Text style={[styles.announceSub, { color: PALETTE.subMuted }]}>
          Local low spotted — tap to view, or enable Alerts to catch the next one.
        </Text>
        <ProgressBar progress={0.72} />
      </View>
<TouchableOpacity
  onPress={() => navigation.navigate('FlashDropScreen')}
  accessibilityLabel="View Flash Drop"
  style={[styles.announceCTA, { backgroundColor: PALETTE.accent }]}
>
  <Text style={styles.announceCTAText}>View</Text>
</TouchableOpacity>

    </View>
  );

  const ActivityFeed = () => (
    <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }] }>
      <View style={styles.cardHead}>
        <View style={styles.rowMid}><View style={styles.feedIcon}/><Text style={[styles.cardTitle, { color: PALETTE.ink, marginLeft: 8 }]}>Recent Activity</Text></View>
        <TouchableOpacity onPress={()=>navigation.navigate('Explore')}><Text style={[styles.link, { color: PALETTE.sub }]}>See all</Text></TouchableOpacity>
      </View>
      {[
        {t:'New verified listings added in your clusters', c:PALETTE.sub},
        {t:'A local average moved this week', c:PALETTE.warning},
        {t:'A provider hit a local low', c:PALETTE.good},
      ].map((e) => (
        <View key={e.t} style={styles.activityRow}> 
          <View style={[styles.activityDot, { backgroundColor: e.c }]} />
          <Text style={[styles.activityText, { color: PALETTE.ink }]}>{e.t}</Text>
        </View>
      ))}
    </View>
  );

  const handleCallHotline = async () => {
    const tel = 'tel:+18005551234';
    const ok = await Linking.canOpenURL(tel);
    if (ok) Linking.openURL(tel);
  };

  /* -------------------------------- Render -------------------------------- */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: PALETTE.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.container]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!!err && (
          <View style={[styles.errorBar, { backgroundColor: PALETTE.warning }]}>
            <Text style={styles.errorBarText}>{err}</Text>
          </View>
        )}

        {/* Header / Identity */}
        <View style={[styles.headerCard, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={safeUser?.profilePicture ? { uri: safeUser.profilePicture } : require('../assets/logo.png')}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.greeting, { color: PALETTE.ink }]}>{greeting}, {safeUser?.firstName || 'Guest'}</Text>
              <Text style={[styles.dateLabel, { color: PALETTE.subMuted }]}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              <TouchableOpacity accessibilityLabel="Open trust score" onPress={() => navigation.navigate('TrustScoreScreen')} style={[styles.scorePill, { borderColor: PALETTE.border }]}>
                <Text style={[styles.scoreText, { color: PALETTE.accent }]}>{(safeUser?.trustScore ?? 4.6).toFixed(2)} Trust</Text>
              </TouchableOpacity>
              <ProgressBar progress={0.58} />
            </View>
          </View>
        </View>

        {/* Announcement */}
        <Announcement />

        {/* Primary Actions */}
        <View style={styles.row}>
          <QuickAction label="Upload Bill" icon={<View style={styles.iconUpload}/>} sublabel="PDF, image, or camera" onPress={() => navigation.navigate('StartSwap')} testID="qa-upload" />
          <QuickAction label="Explore Market" icon={<View style={styles.iconSearch}/>} sublabel="See bills near you" onPress={() => navigation.navigate('Explore')} testID="qa-market" />
        </View>
        <View style={styles.row}>
          <QuickAction label="Clusters" icon={<View style={styles.iconCluster}/>} sublabel="Providers & ZIP groups" onPress={() => navigation.navigate('ClustersScreen')} testID="qa-clusters" />
          <QuickAction label="Alerts & Hotline" icon={<View style={styles.iconBell}/>} sublabel="Text, WhatsApp, Voice" onPress={() => navigation.navigate('Alerts')} testID="qa-alerts" />
        </View>

        {/* My Bills Snapshot */}
        <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: PALETTE.ink }]}>My Bills</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Upload')}>
              <Text style={[styles.link, { color: PALETTE.sub }]}>View all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.skeletonRow}>
              {[1,2,3].map((k)=> <View key={k} style={[styles.skeletonCard, { backgroundColor: PALETTE.tintSoft, borderColor: PALETTE.border }]} />)}
            </View>
          ) : (
            <FlatList
              data={myBills}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={BillCard}
              ListEmptyComponent={
                <Text style={{ color: PALETTE.subMuted }}>No bills yet — upload one to get started.</Text>
              }
            />
          )}
        </View>

        {/* Marketplace Preview (excludes my own bills) */}
        <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: PALETTE.ink }]}>Marketplace — Near You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={[styles.link, { color: PALETTE.sub }]}>See more</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={market}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={SpecCard}
            ListEmptyComponent={
              <Text style={{ color: PALETTE.subMuted }}>No listings yet.</Text>
            }
          />
        </View>

        {/* Your Clusters (real follows; no samples) */}
        <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: PALETTE.ink }]}>Your Clusters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ClustersScreen')}>
              <Text style={[styles.link, { color: PALETTE.sub }]}>Manage</Text>
            </TouchableOpacity>
          </View>

          {clusters.length > 0 ? (
            <View style={styles.chips}>
              {clusters.map((c) => (
                <TouchableOpacity
                  key={c.clusterId}
                  onPress={() => navigation.navigate('ClusterDetail', { clusterId: c.clusterId })}
                  style={[styles.chip, { borderColor: PALETTE.border, backgroundColor: PALETTE.tintSoft }]}
                >
                  <Text style={[styles.chipText, { color: PALETTE.ink }]} numberOfLines={1}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: PALETTE.subMuted }}>
              Follow clusters on the Clusters page and they’ll appear here.
            </Text>
          )}

          <View style={styles.clusterHintRow}>
            <Text style={[styles.clusterHint, { color: PALETTE.subMuted }]}>
              {clusters.length ? `Following ${clusters.length} cluster${clusters.length>1?'s':''}.` : ''}
            </Text>
          </View>
        </View>

        {/* Realtime: Alerts + Hotline */}
        <View style={styles.splitRow}>
          <View style={[styles.card, styles.splitCol, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
            <View style={styles.cardHead}><View style={styles.rowMid}><View style={styles.iconBellSmall}/><Text style={[styles.cardTitle, { color: PALETTE.ink, marginLeft: 8 }]}>Alerts</Text></View></View>
            <Text style={[styles.muted, { color: PALETTE.subMuted }]}>Subscribe to Flash Drops, spikes, and lowest listings via SMS/WhatsApp.</Text>
            <View style={{ height: 10 }} />
            <TouchableOpacity accessibilityLabel={alertSubscribed ? 'Manage alerts' : 'Enable alerts'} onPress={() => setAlertSubscribed((v)=>!v)} style={[styles.primaryBtn, { backgroundColor: alertSubscribed ? PALETTE.sub : PALETTE.accent }]}>
              <Text style={styles.primaryBtnText}>{alertSubscribed ? 'Subscribed' : 'Enable Alerts'}</Text>
            </TouchableOpacity>
            <Text style={[styles.smallNote, { color: PALETTE.subMuted }]}>You can change preferences anytime.</Text>
          </View>
          <View style={[styles.card, styles.splitCol, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
            <View style={styles.cardHead}><View style={styles.rowMid}><View style={styles.iconPhone}/><Text style={[styles.cardTitle, { color: PALETTE.ink, marginLeft: 8 }]}>Hotline</Text></View></View>
            <Text style={[styles.muted, { color: PALETTE.subMuted }]}>Call to hear local averages, trends, and join town halls.</Text>
            <View style={{ height: 10 }} />
            <TouchableOpacity accessibilityLabel="Call Billix Hotline" onPress={handleCallHotline} style={[styles.primaryBtn, { backgroundColor: PALETTE.sub }]}>
              <Text style={styles.primaryBtnText}>Call Billix Hotline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <ActivityFeed />

        {/* Education / Help */}
        <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: PALETTE.ink }]}>Learn to Lower Your Bills</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HelpScreen')}>
              <Text style={[styles.link, { color: PALETTE.sub }]}>See guides</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.guidesRow}>
            {['Find hidden fees', 'Win retention calls', 'Compare like a pro'].map((t) => (
              <View style={[styles.guideTile, { backgroundColor: PALETTE.tintSoft, borderColor: PALETTE.border }]} key={t}>
                <Text style={[styles.guideTitle, { color: PALETTE.ink }]}>{t}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HelpScreen')}>
                  <Text style={[styles.link, { color: PALETTE.sub }]}>Open</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Refer */}
        <View style={[styles.card, { backgroundColor: PALETTE.card, borderColor: PALETTE.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: PALETTE.ink }]}>Invite & Earn Bill Credits</Text>
          </View>
          <Text style={[styles.muted, { color: PALETTE.subMuted }]}>Share Billix with a friend. When they upload a verified bill, you both earn credits to unlock marketplace insights.</Text>
          <View style={{ height: 10 }} />
          <TouchableOpacity onPress={() => navigation.navigate('Referral')} style={[styles.secondaryBtn, { borderColor: PALETTE.border }]}>
            <Text style={[styles.secondaryBtnText, { color: PALETTE.sub }]}>Get Invite Link</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------------- Styles -------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16 },

  errorBar: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginHorizontal: 16, marginBottom: 12 },
  errorBarText: { color: '#fff', fontWeight: '700' },

  headerCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#cfd8d1' },
  greeting: { fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  dateLabel: { marginTop: 2 },
  scorePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#EAF6EF', borderWidth: 1 },
  scoreText: { fontWeight: '700' },

  // Icons (simple, no libs)
  circleIcon: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8AD1B0', marginRight: 8 },
  squareIcon: { width: 10, height: 10, backgroundColor: '#8AD1B0', marginRight: 8, borderRadius: 2 },
  iconUpload: { width: 18, height: 18, borderColor: '#2E7D32', borderWidth: 2, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderBottomWidth: 0 },
  iconSearch: { width: 18, height: 18, borderColor: '#2E7D32', borderWidth: 2, borderRadius: 9 },
  iconCluster: { width: 18, height: 18, borderColor: '#2E7D32', borderWidth: 2, borderRadius: 3 },
  iconBell: { width: 18, height: 18, borderColor: '#2E7D32', borderWidth: 2, borderTopLeftRadius: 9, borderTopRightRadius: 9, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  iconBellSmall: { width: 14, height: 14, borderColor: '#2E7D32', borderWidth: 2, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  iconPhone: { width: 16, height: 16, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#2E7D32', transform: [{ rotate: '45deg' }], borderTopWidth: 0, borderRightWidth: 0 },
  feedIcon: { width: 12, height: 12, backgroundColor: '#2E7D32', borderRadius: 2 },

  rowMid: { flexDirection: 'row', alignItems: 'center' },

  // KPI strip
  kpiRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  kpi: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  kpiVal: { fontSize: 22, fontWeight: '900' },
  kpiLab: { fontSize: 12, marginTop: 2 },

  // Announcement
  announceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  announceBadge: { width: 10, height: '100%', minHeight: 52, borderRadius: 6 },
  announceTitle: { fontWeight: '900', fontSize: 15, letterSpacing: 0.2 },
  announceSub: { fontSize: 13, marginTop: 2, marginBottom: 10, lineHeight: 18 },
  announceCTA: {
    width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  announceCTAText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.2 },

  progressOuter: { height: 8, borderRadius: 999, backgroundColor: '#E4EFE7', overflow: 'hidden', marginTop: 2 },
  progressInner: { height: 8, backgroundColor: '#2E7D32' },

  // Rows & Cards
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionLabel: { fontSize: 16, fontWeight: '800' },
  actionSublabel: { marginTop: 2 },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  link: { fontWeight: '700' },

  // Skeletons
  skeletonRow: { flexDirection: 'row', gap: 12 },
  skeletonCard: { width: 180, height: 120, borderRadius: 14, borderWidth: 1 },

  // My Bills
  billCard: { width: 200, borderWidth: 1, borderRadius: 16, padding: 14 },
  billHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  billProvider: { fontWeight: '800' },
  billType: { marginTop: 2 },
  billRowBottom: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billTotal: { fontSize: 22, fontWeight: '900' },
  deltaPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F2FBF7', borderWidth: 1, borderColor: '#E6F5E9' },
  deltaText: { fontWeight: '800' },

  // Sparkline
  sparkWrap: { flexDirection: 'row', gap: 2, marginTop: 10 },
  sparkBar: { width: 8, backgroundColor: '#8AD1B0', borderRadius: 4 },

  // Marketplace preview
  specCard: { width: 200, borderWidth: 1, borderRadius: 16, padding: 14 },
  specHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  specProvider: { fontWeight: '800', flex: 1 },
  verifiedPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  specMeta: { marginTop: 6 },
  specTotal: { fontSize: 22, fontWeight: '900', marginTop: 10 },
  specFees: { marginTop: 2 },

  // Clusters
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipText: { fontWeight: '700' },
  clusterHintRow: { marginTop: 10 },
  clusterHint: {},

  // Realtime split
  splitRow: { flexDirection: 'row', gap: 12 },
  splitCol: { flex: 1 },

  // Buttons
  primaryBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#EEF7F1', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  secondaryBtnText: { fontWeight: '800' },
  muted: {},
  smallNote: { fontSize: 11, marginTop: 6 },

  // Guides
  guidesRow: { flexDirection: 'row', gap: 10 },
  guideTile: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  guideTitle: { fontWeight: '800', marginBottom: 6 },

  // Activity feed
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { fontWeight: '700' },
});
