// app/screens/ClustersScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

/* ------------------------------- Config ---------------------------------- */
const BASE_URL = Platform.select({
  ios: 'http://127.0.0.1:5000',
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

/* -------------------------------- Theme ---------------------------------- */
const makePalette = (scheme = 'light') => {
  const isDark = scheme === 'dark';
  return {
    bg: isDark ? '#0E1713' : '#E6F5E9',
    card: isDark ? '#14221B' : '#FFFFFF',
    ink: isDark ? '#ECF3EF' : '#0B1C15',
    sub: isDark ? '#9FD8B8' : '#4A7C59',
    subMuted: isDark ? '#80A28E' : '#6E8F7A',
    border: isDark ? '#254331' : '#DDEDE2',
    accent: isDark ? '#1F8A6E' : '#2E7D32',
    warning: isDark ? '#F1A16E' : '#B95000',
    good: isDark ? '#6BE0B1' : '#0E8F62',
    tintSoft: isDark ? '#0F1C16' : '#F7FBF8',
    softShadow: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.06)',
  };
};

/* --------------------------- Helpers & Shapes ---------------------------- */
const toKey = (m) =>
  `${(m.provider || '').trim()}|${(m.state || '').trim()}|${(m.category || m.service || '').trim()}`;

// ✅ Canonicalize ids everywhere (server expects "Provider|ST|Category")
const toCanonicalId = (id) => String(id || '').replace(/^c-/, '');

const deriveClustersFromListings = (listings = []) => {
  const byKey = new Map();
  for (const m of listings) {
    const key = toKey(m); // canonical
    if (!key) continue;
    if (!byKey.has(key)) {
      byKey.set(key, {
        id: key, // ✅ no "c-" prefix
        label: `${m.provider} · ${m.state} · ${m.category}`,
        provider: m.provider,
        service: m.category,
        state: m.state,
        members: 0,
        watchers: 0,
        follows: 0,
        hotness: 0,
        lows30d: 0,
        following: false,
      });
    }
    const c = byKey.get(key);
    c.members += 1;
    c.watchers += Number(m.market?.watchers ?? 0);
    c.follows += Number(m.market?.followers ?? 0);
    c.hotness += Number(m.market?.hotness ?? 0);
  }

  return Array.from(byKey.values()).map((c) => ({
    ...c,
    watchers: Math.round(c.watchers / Math.max(1, c.members)),
    follows: Math.round(c.follows / Math.max(1, c.members)),
    hotness: Math.round(c.hotness / Math.max(1, c.members)),
  }));
};

/* --------------------------------- Screen -------------------------------- */
export default function ClustersScreen() {
  const navigation = useNavigation();
  const scheme = useColorScheme?.() || 'light';
  const PALETTE = makePalette(scheme);

  // data
  const [clusters, setClusters] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set()); // canonical ids
  const [userState, setUserState] = useState(''); // locked filter
  // ui
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');
  // filters (state is locked to userState)
  const [q, setQ] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortKey, setSortKey] = useState('hot'); // hot | watchers | lows | members

  // view-tracking cache (avoid spamming backend)
  const seenRef = useRef(new Set());

  const fetchProfileState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const st = (data?.state || '').toUpperCase();
      if (st && st !== userState) setUserState(st);
    } catch {
      /* ignore */
    }
  }, [userState]);

  // Try to load follows (normalize ids!)
  const fetchFollows = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setFollowingIds(new Set());
        return;
      }
      const res = await fetch(`${BASE_URL}/api/market/follows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('follows');
      const arr = await res.json(); // [{ clusterId }]
      const ids = new Set(
        (arr || []).map((x) => toCanonicalId(x.clusterId || x.id || x.cluster_id))
      );
      setFollowingIds(ids);
    } catch {
      setFollowingIds(new Set());
    }
  }, []);

  // Load clusters (server first, fallback to listings)
  const fetchClusters = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      // Always include the user's state so clusters are state-scoped
      const r1 = await fetch(
        `${BASE_URL}/api/market/clusters?` +
          new URLSearchParams({
            ...(userState ? { state: userState } : {}),
            ...(serviceFilter ? { service: serviceFilter } : {}),
            ...(q ? { q } : {}),
          }),
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      if (r1.ok) {
        const arr = await r1.json();
        setClusters(
          arr.map((c) => {
            const rawId =
              c.id ?? c.clusterId ?? `${c.provider}|${c.state}|${c.service ?? c.category}`;
            const id = toCanonicalId(rawId);
            return {
              id,
              label:
                c.label ?? `${c.provider} · ${c.state}${c.service ? ` · ${c.service}` : ''}`,
              provider: c.provider,
              service: c.service ?? c.category,
              state: c.state,
              members: c.members ?? c.count ?? 0,
              watchers: c.watchers ?? 0,
              follows: c.follows ?? 0,
              hotness: c.hotness ?? 0,
              lows30d: c.lows30d ?? c.lows ?? 0,
              following: Boolean(c.following) || false,
            };
          })
        );
      } else {
        // fallback: derive from listings and state-filter client-side
        const r2 = await fetch(`${BASE_URL}/api/market/listings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!r2.ok) throw new Error('listings');
        const listings = await r2.json();
        const derived = deriveClustersFromListings(
          userState ? listings.filter((m) => m.state === userState) : listings
        );
        setClusters(derived);
      }
    } catch (e) {
      setErr('Unable to load clusters');
      setClusters([]);
    } finally {
      setLoading(false);
    }
  }, [q, serviceFilter, userState]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileState();
      fetchFollows();
      fetchClusters();
    }, [fetchProfileState, fetchFollows, fetchClusters])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfileState(), fetchFollows(), fetchClusters()]);
    setRefreshing(false);
  }, [fetchProfileState, fetchFollows, fetchClusters]);

  /* ------------------------------- Actions -------------------------------- */
  const toggleFollow = useCallback(
    async (cluster) => {
      const canonicalId = toCanonicalId(cluster.id);
      const token = await AsyncStorage.getItem('token');

      // optimistic
      const wasFollowed = followingIds.has(canonicalId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        wasFollowed ? next.delete(canonicalId) : next.add(canonicalId);
        return next;
      });

      try {
        if (!token) return; // stay optimistic when logged out
        const res = await fetch(
          `${BASE_URL}/api/market/follow${
            wasFollowed ? `/${encodeURIComponent(canonicalId)}` : ''
          }`,
          {
            method: wasFollowed ? 'DELETE' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: wasFollowed ? undefined : JSON.stringify({ clusterId: canonicalId }),
          }
        );
        if (!res.ok) throw new Error('follow-failed');

        // Optional: refresh follows from server to stay perfectly in sync
        // await fetchFollows();
      } catch {
        // revert on error
        setFollowingIds((prev) => {
          const next = new Set(prev);
          wasFollowed ? next.add(canonicalId) : next.delete(canonicalId);
          return next;
        });
      }
    },
    [followingIds]
  );

  // fire a "view" ping when a card becomes visible (once per session per cluster)
  const sendViewPing = useCallback(async (clusterId) => {
    const canonicalId = toCanonicalId(clusterId);
    if (seenRef.current.has(canonicalId)) return;
    seenRef.current.add(canonicalId);
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/api/market/cluster/${encodeURIComponent(canonicalId)}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
    } catch {
      /* ignore */
    }
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    for (const vi of viewableItems || []) {
      if (vi?.item?.id) sendViewPing(vi.item.id);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  /* ------------------------------ Derivations ----------------------------- */
  const services = useMemo(
    () => Array.from(new Set(clusters.map((c) => c.service).filter(Boolean))).sort(),
    [clusters]
  );

  const filtered = useMemo(() => {
    let list = clusters;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.label || '').toLowerCase().includes(needle) ||
          (c.provider || '').toLowerCase().includes(needle) ||
          (c.service || '').toLowerCase().includes(needle)
      );
    }
    if (serviceFilter) list = list.filter((c) => c.service === serviceFilter);

    switch (sortKey) {
      case 'watchers':
        list = [...list].sort((a, b) => (b.watchers || 0) - (a.watchers || 0));
        break;
      case 'lows':
        list = [...list].sort((a, b) => (b.lows30d || 0) - (a.lows30d || 0));
        break;
      case 'members':
        list = [...list].sort((a, b) => (b.members || 0) - (a.members || 0));
        break;
      case 'hot':
      default:
        list = [...list].sort((a, b) => (b.hotness || 0) - (a.hotness || 0));
    }
    return list;
  }, [clusters, q, serviceFilter, sortKey]);

  /* --------------------------------- UI ----------------------------------- */
  const canGoBack = navigation?.canGoBack?.() || false;

  const ClusterCard = ({ item }) => {
    const canonicalId = toCanonicalId(item.id);
    const followed = item.following || followingIds.has(canonicalId);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ClusterDetail', { clusterId: canonicalId })}
        style={[styles(PALETTE).card]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.label}`}
        activeOpacity={0.9}
      >
        <View style={styles(PALETTE).cardTop}>
          <View style={styles(PALETTE).pillBadge} />
          <Text style={styles(PALETTE).cardTitle} numberOfLines={1}>
            {item.label}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFollow(item)}
            style={[
              styles(PALETTE).followBtn,
              { backgroundColor: followed ? PALETTE.sub : PALETTE.accent },
            ]}
            accessibilityRole="button"
            accessibilityLabel={followed ? 'Unfollow cluster' : 'Follow cluster'}
          >
            <Text style={styles(PALETTE).followBtnText}>{followed ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles(PALETTE).metaRow}>
          <Text style={styles(PALETTE).meta}>{item.provider}</Text>
          <Dot />
          <Text style={styles(PALETTE).meta}>{item.service}</Text>
          <Dot />
          <Text style={styles(PALETTE).meta}>{item.state}</Text>
        </View>

        <View style={styles(PALETTE).kpiRow}>
          <KPI label="Members" value={item.members ?? 0} />
          <Divider PALETTE={PALETTE} />
          <KPI label="Watchers" value={item.watchers ?? 0} />
          <Divider PALETTE={PALETTE} />
          <KPI label="Hotness" value={item.hotness ?? 0} />
          <Divider PALETTE={PALETTE} />
          <KPI label="Lows (30d)" value={item.lows30d ?? 0} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles(PALETTE).safe]}>
      {/* Header */}
      <View style={styles(PALETTE).header}>
        <View style={styles(PALETTE).headerRow}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              style={styles(PALETTE).backBtn}
            >
              <Text style={styles(PALETTE).backIcon}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles(PALETTE).h1}>Clusters</Text>
            <Text style={styles(PALETTE).subH}>State-scoped groups from Billix-Verified listings.</Text>
          </View>

          {/* Locked state chip */}
          <View style={styles(PALETTE).stateChip}>
            <Text style={styles(PALETTE).stateChipText}>{userState || '—'}</Text>
          </View>
        </View>

        <InfoStrip PALETTE={PALETTE} />
      </View>

      {/* Controls */}
      <View style={styles(PALETTE).controls}>
        <Input
          value={q}
          onChangeText={setQ}
          placeholder={`Search in ${userState || 'your state'}…`}
          PALETTE={PALETTE}
        />
        <PillSelect
          label={serviceFilter || 'Service'}
          options={services}
          onSelect={setServiceFilter}
          PALETTE={PALETTE}
        />
        <PillSelect
          label={
            { hot: 'Sort: Hot', watchers: 'Sort: Watchers', lows: 'Sort: Lows', members: 'Sort: Members' }[
              sortKey
            ]
          }
          options={['hot', 'watchers', 'lows', 'members']}
          onSelect={setSortKey}
          mapLabel={(v) =>
            ({ hot: 'Sort: Hot', watchers: 'Sort: Watchers', lows: 'Sort: Lows', members: 'Sort: Members' }[v])
          }
          PALETTE={PALETTE}
        />
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View style={styles(PALETTE).centerPad}>
          <ActivityIndicator color={PALETTE.accent} />
          <Text style={styles(PALETTE).mutedPad}>Loading clusters…</Text>
        </View>
      ) : err ? (
        <View style={styles(PALETTE).centerPad}>
          <Text style={styles(PALETTE).errText}>{err}</Text>
          <TouchableOpacity onPress={fetchClusters} style={styles(PALETTE).retryBtn}>
            <Text style={{ color: PALETTE.sub }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          renderItem={ClusterCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles(PALETTE).centerPad}>
              <Text style={{ color: PALETTE.subMuted }}>No clusters found.</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}
    </SafeAreaView>
  );
}

/* ------------------------------- Subcomponents --------------------------- */
const Dot = () => (
  <View
    style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#B7C9BE', marginHorizontal: 8 }}
  />
);

const Divider = ({ PALETTE }) => <View style={{ width: 1, height: 22, backgroundColor: PALETTE.border }} />;

const KPI = ({ label, value }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={{ color: '#5B6A61', fontSize: 12 }}>{label}</Text>
    <Text style={{ color: '#0B1C15', fontWeight: '900', fontSize: 18 }}>
      {Number(value || 0).toLocaleString()}
    </Text>
  </View>
);

const InfoStrip = ({ PALETTE }) => (
  <View style={[styles(PALETTE).infoStrip]}>
    <Text style={styles(PALETTE).infoDot}>●</Text>
    <Text style={styles(PALETTE).infoText}>
      <Text style={{ fontWeight: '900' }}>Watchers</Text> rise as people view a cluster.{' '}
      <Text style={{ fontWeight: '900' }}>Hotness</Text> blends watchers, follows, and recent activity.{' '}
      <Text style={{ fontWeight: '900' }}>Lows (30d)</Text> counts new local lows in the last month.
    </Text>
  </View>
);

const Input = ({ value, onChangeText, placeholder, PALETTE }) => (
  <View style={styles(PALETTE).inputWrap}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={PALETTE.subMuted}
      style={styles(PALETTE).input}
      returnKeyType="search"
    />
  </View>
);

const PillSelect = ({ label, options = [], onSelect, mapLabel, PALETTE }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles(PALETTE).pill} activeOpacity={0.9}>
        <Text style={{ color: PALETTE.ink, fontWeight: '800' }}>{label}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles(PALETTE).menu}>
          <TouchableOpacity
            onPress={() => {
              onSelect('');
              setOpen(false);
            }}
            style={styles(PALETTE).menuItem}
          >
            <Text style={{ color: PALETTE.subMuted }}>Any</Text>
          </TouchableOpacity>
          {options.map((o) => (
            <TouchableOpacity
              key={String(o)}
              onPress={() => {
                onSelect(o);
                setOpen(false);
              }}
              style={styles(PALETTE).menuItem}
            >
              <Text style={{ color: PALETTE.ink, fontWeight: '700' }}>
                {mapLabel ? mapLabel(o) : o}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

/* --------------------------------- Styles -------------------------------- */
const styles = (PALETTE) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: PALETTE.bg },
    header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: PALETTE.border,
      backgroundColor: PALETTE.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { color: PALETTE.ink, fontSize: 22, fontWeight: '900', marginTop: -2 },
    h1: { fontSize: 26, fontWeight: '900', letterSpacing: 0.2, color: PALETTE.ink },
    subH: { marginTop: 2, color: PALETTE.subMuted },

    stateChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: PALETTE.border,
      backgroundColor: PALETTE.tintSoft,
    },
    stateChipText: { color: PALETTE.ink, fontWeight: '800' },

    infoStrip: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: PALETTE.border,
      backgroundColor: PALETTE.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      shadowColor: PALETTE.softShadow,
      shadowOpacity: 1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    infoDot: { color: PALETTE.accent, marginRight: 6 },
    infoText: { color: PALETTE.subMuted, lineHeight: 18 },

    controls: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center',
    },

    inputWrap: {
      flexGrow: 1,
      flexBasis: 220,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: PALETTE.card,
      borderColor: PALETTE.border,
    },
    input: { color: PALETTE.ink, fontWeight: '600' },

    pill: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: PALETTE.card,
      borderColor: PALETTE.border,
    },
    menu: {
      position: 'absolute',
      top: 46,
      left: 0,
      right: 0,
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: PALETTE.card,
      borderColor: PALETTE.border,
    },
    menuItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: PALETTE.border },

    card: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 14,
      backgroundColor: PALETTE.card,
      borderColor: PALETTE.border,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pillBadge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8AD1B0', marginTop: 2 },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: PALETTE.ink },
    followBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    followBtnText: { color: '#fff', fontWeight: '800' },

    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    meta: { fontSize: 12, color: PALETTE.subMuted },

    kpiRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: PALETTE.border,
      borderRadius: 12,
      backgroundColor: PALETTE.tintSoft,
    },

    centerPad: { alignItems: 'center', justifyContent: 'center', paddingTop: 28 },
    mutedPad: { marginTop: 8, color: PALETTE.subMuted },
    errText: { color: PALETTE.warning, fontWeight: '800' },
    retryBtn: {
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: PALETTE.border,
      backgroundColor: PALETTE.card,
    },
  });
