// ExploreScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { decorateListing } from './SwapBills/store/billCardSchemas';

/** ------------------------------- Config -------------------------------- */
const API_BASE = 'http://localhost:5000';

// TODO: adjust this path to where your logo actually lives
const BILLIX_LOGO = require('../assets/logo.png');

const withCreds = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

/** ------------------------------- Theme -------------------------------- */
const COLORS = {
  bg: '#F3F6F4',
  surface: '#FFFFFF',
  border: '#E4EAE5',
  text: '#0B1C15',
  subtext: '#5B6A61',
  muted: '#93A29B',
  primary: '#1F8A6E',
  primaryTint: '#E6F5E9',
  primarySoft: '#F2FBF7',
  danger: '#D92D20',
  warn: '#B95000',
};
const ELEV = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};
const { height: SCREEN_H } = Dimensions.get('window');

/** ------------------------------- Lookups ------------------------------ */
const STATES = [
  { code: 'NY', name: 'New York' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'GA', name: 'Georgia' },
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'FL', name: 'Florida' },
];

const BILL_GROUPS = [
  { key: 'utilities', label: 'Household Utilities', members: ['Utility', 'Electricity', 'Natural Gas', 'Water', 'Sewer / Wastewater', 'Trash / Recycling Pickup', 'Heating Oil', 'Propane'] },
  { key: 'telecom', label: 'Telecom & Connectivity', members: ['Internet', 'Cable / TV Service', 'Landline Phone', 'Mobile / Wireless Phone', 'Phone', 'Streaming Service'] },
  { key: 'housing', label: 'Housing', members: ['Rent', 'Mortgage', 'HOA Fees', 'Property Taxes', 'Home Insurance'] },
  { key: 'transport', label: 'Transportation', members: ['Car Loan / Lease Payment', 'Car Insurance', 'Public Transit Pass / Fare', 'Tolls', 'Parking Permit / Garage Rental'] },
  { key: 'insurance', label: 'Insurance (Non-Housing)', members: ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance', 'Pet Insurance'] },
  { key: 'subscriptions', label: 'Subscriptions', members: ['Gym Membership', 'Cloud Storage / Software Subscriptions', 'Streaming Service'] },
];
const groupForCategory = (cat?: string) => {
  if (!cat) return 'utilities';
  const entry = BILL_GROUPS.find((g) => g.members.map((m) => m.toLowerCase()).includes(cat.toLowerCase()));
  return entry ? entry.key : 'utilities';
};

/** ------------------------------- Utils -------------------------------- */
const safeNum = (n: any) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};
const formatMoney = (n: number | string | null | undefined) => `$${safeNum(n).toFixed(2)}`;
const pct = (v: number) => `${v > 0 ? '+' : ''}${Number(v).toFixed(0)}%`;
const dateDiffInDays = (iso: string) => Math.ceil((new Date(iso).getTime() - new Date().getTime()) / 86400000);
const dueLabel = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const inDays = dateDiffInDays(iso);
  if (inDays < 0) return `Past due • ${d.toLocaleDateString()}`;
  if (inDays === 0) return 'Due today';
  if (inDays === 1) return 'Due tomorrow';
  return `Due in ${inDays} days`;
};

/** ------------------------------ Small UI ----------------------------- */
const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]} accessibilityRole="button" hitSlop={8}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

/** A dropdown with absolute menu (stays on top), closes on select/scroll */
const Dropdown = ({
  label, valueLabel, options, onSelect, width = 164, open, setOpen,
}: {
  label: string;
  valueLabel: string;
  options: { label: string; value: string }[];
  onSelect: (v: string) => void;
  width?: number;
  open: string;
  setOpen: (s: string) => void;
}) => {
  return (
    <View style={{ width, marginRight: 8 }}>
      <Pressable
        onPress={() => setOpen(open === label ? '' : label)}
        style={[styles.ddTrigger, open === label && styles.ddTriggerOpen]}
        accessibilityRole="button"
        accessibilityLabel={`${label} dropdown`}
        hitSlop={6}
      >
        <Text style={styles.ddLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.ddValue}>{valueLabel}</Text>
      </Pressable>

      {open === label && (
        <View style={[styles.ddMenu, { width }]}>
          <View style={styles.ddMenuInner}>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { onSelect(opt.value); setOpen(''); }}
                style={styles.ddItem}
              >
                <Text numberOfLines={1} style={styles.ddItemText}>{opt.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setOpen('')} style={styles.ddCloseRow} hitSlop={8}>
              <Text style={styles.ddCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const SpecRow = ({ k, v }: { k: string; v?: string | number }) => (
  <View style={styles.specRow}>
    <Text style={styles.specKey}>{k}</Text>
    <Text style={styles.specValue}>{v ?? '—'}</Text>
  </View>
);

/** -------------------------------- Cards ------------------------------ */
const ProviderMark = ({ item, size = 44 }: { item: any; size?: number }) => {
  const initials = (item.provider || '??').slice(0, 2).toUpperCase();
  const borderRadius = size / 2;
  if (item.logoUrl) {
    return (
      <Image
        source={{ uri: item.logoUrl }}
        style={{ width: size, height: size, borderRadius, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' }}
        resizeMode="contain"
        accessible
        accessibilityLabel={`${item.provider} logo`}
      />
    );
  }
  return (
    <View style={[styles.logoCircle, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.logoText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
};

const BillCard = ({
  item, onOpen, onToggleSave, onPlaybook, onPing, saved, pinged,
}: {
  item: any;
  onOpen: (i: any) => void;
  onToggleSave: (i: any) => void;
  onPlaybook: (i: any) => void;
  onPing: (i: any) => void;
  saved: boolean;
  pinged: boolean;
}) => {
  const hasAvg = !!item.market?.regionalAvg && item.market.regionalAvg > 0;
  const vsAvgRaw = hasAvg ? ((safeNum(item.amountDue) - item.market.regionalAvg) / item.market.regionalAvg) * 100 : 0;
  const vsAvg = Math.round(vsAvgRaw);
  const vsAvgLabel = hasAvg ? `${vsAvg > 0 ? '+' : ''}${vsAvg}%` : '—';

  return (
    <Pressable
      onPress={() => onOpen(item)}
      delayPressIn={80}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.provider} ${item.category} in ${item.city}`}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.logoWrap}>
          <ProviderMark item={item} />
          <View>
            <Text numberOfLines={1} style={styles.provider}>{item.provider}</Text>
            <Text numberOfLines={1} style={styles.location}>
              {item.city}, {item.state} • {item.category}
            </Text>
          </View>
        </View>

        {hasAvg && (
          <View style={[styles.pill, vsAvg < 0 ? styles.pillGood : styles.pillBad]}>
            <Text style={styles.pillText}>{vsAvgLabel}</Text>
          </View>
        )}
      </View>

      {/* Price row */}
      <View style={styles.priceRow}>
        <Text style={styles.amount}>{formatMoney(item.amountDue)}</Text>
        <Text style={styles.due}>{dueLabel(item.dueDate)}</Text>
      </View>

      {/* Trust row */}
      <View style={styles.verifiedRow}>
        <Text style={styles.clusterTitle}>Billix-Verified</Text>
        <View style={styles.badgeRowTight}>
          {(item.trustTags || []).slice(0, 3).map((t: string) => (
            <View key={t} style={[styles.badge, styles.badgeNeutral]}>
              <Text style={styles.badgeText}>{t}</Text>
            </View>
          ))}
          <View style={[styles.badge, styles.badgeNeutral]}>
            <Text style={styles.badgeText}>{item.friction} Friction</Text>
          </View>
        </View>
      </View>

      {/* Market signals */}
      <View style={[styles.signalRow, styles.signalRowBox]}>
        <View style={styles.signal}>
          <Text style={styles.sigLabel}>Watchers</Text>
          <Text style={styles.sigValue}>{item.watchers ?? 0}</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.signal}>
          <Text style={styles.sigLabel}>Follows</Text>
          <Text style={styles.sigValue}>{item.followers ?? 0}</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.signal}>
          <Text style={styles.sigLabel}>Hotness</Text>
          <Text style={styles.sigValue}>{item.hotness ?? 0}</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.signal}>
          <Text style={styles.sigLabel}>Swaps (30d)</Text>
          <Text style={styles.sigValue}>{item.market?.swaps30d ?? 0}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <Pressable onPress={() => onToggleSave(item)} style={styles.ghostBtn} hitSlop={6}>
          <Text style={styles.ghostBtnText}>{saved ? 'Saved' : 'Save'}</Text>
        </Pressable>
        <Pressable onPress={() => onPlaybook(item)} style={styles.secondaryBtn} hitSlop={6}>
          <Text style={styles.secondaryBtnText}>Request Playbook</Text>
        </Pressable>
        <Pressable onPress={() => onPing(item)} style={styles.primaryBtn} hitSlop={6}>
          <Text style={styles.primaryBtnText}>
            {pinged ? 'Watching' : 'Follow'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const SpecsCard = ({ item }: { item: any }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>Specs</Text>
    <View style={styles.specGrid}>
      <SpecRow k="Provider" v={item.provider} />
      <SpecRow k="Service" v={item.specs?.service} />
      <SpecRow k="Region" v={`${item.city}, ${item.state}`} />
      <SpecRow k="Billing Month" v={item.specs?.billingMonth} />
      <SpecRow k="Base Plan" v={formatMoney(item.specs?.basePlan)} />
      <SpecRow k="Taxes & Fees" v={formatMoney(item.specs?.taxesFees)} />
      <SpecRow k="Usage" v={item.specs?.usageLabel} />
      <SpecRow k="Contract" v={item.specs?.contract} />
      <SpecRow k="Promo Active" v={item.specs?.promoActive ? 'Yes' : 'No'} />
    </View>
  </View>
);

const MarketCard = ({ item }: { item: any }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>Market Signals</Text>
    <View style={styles.marketRow}>
      <Stat label="Median (90d)" value={formatMoney(item.market?.median90d)} />
      <Stat label="Regional Avg" value={formatMoney(item.market?.regionalAvg)} />
      <Stat label="Swaps (30d)" value={`${item.market?.swaps30d ?? 0}`} />
    </View>
    <View style={[styles.marketRow, { marginTop: 8 }]}>
      <Stat label="Watchers" value={`${item.watchers ?? 0}`} />
      <Stat label="Follows" value={`${item.followers ?? 0}`} />
      <Stat label="Hotness" value={`${item.hotness ?? 0}`} />
    </View>
    <Text style={styles.marketHint}>
      Signals come from peer-uploaded, Billix-Verified bills in this cluster. No money moves through Billix in Phase 1.
    </Text>
  </View>
);

const RelatedBills = ({ all, current, onOpen }: { all: any[]; current: any; onOpen: (i: any) => void }) => {
  const rel = all
    .filter((b) => b.id !== current.id && b.provider === current.provider && b.state === current.state)
    .slice(0, 5);
  if (!rel.length) return null;
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Other {current.provider} in {current.state}</Text>
      {rel.map((b) => (
        <Pressable key={b.id} onPress={() => onOpen(b)} style={styles.relatedRow} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.relatedLeft}>{b.city}</Text>
          <Text style={styles.relatedMid}>{b.category}</Text>
          <Text style={styles.relatedRight}>{formatMoney(b.amountDue)}</Text>
        </Pressable>
      ))}
    </View>
  );
};

/** -------------------------------- Screen ----------------------------- */
export default function ExploreScreen() {
  /** Data fetch */
  const [apiBills, setApiBills] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const mapListing = useCallback((m: any) => {
    // let your decorator do canonicalization first
    const d = decorateListing(m); // <- returns a normalized shape
  
    return {
      id: `ml-${d.id}`,
      billId: d.bill_id,
      clusterId: d.clusterId || d.cluster_id || null,
      logoUrl: d.logoUrl || d.logo_url || null,
      provider: d.provider,
      category: d.category,
      city: d.city || '—',
      state: d.state || '—',
      amountDue: Number.isFinite(+d.amountDue) ? +d.amountDue : 0,
      dueDate: d.dueDate || new Date().toISOString(),
      discountPercent: Number.isFinite(+d.discountPercent) ? +d.discountPercent : 0,
      friction: d.friction || 'Low',
      trustTags: d.trustTags || d.trust_tags || ['Phone/Carrier Check', 'Masked Details'],
      perks: d.perks || [],
      rating: d.rating || 4.7,
      asks: d.asks || 0,
      watchers: d.market?.watchers ?? 0,
      followers: d.market?.followers ?? 0,
      hotness: d.market?.hotness ?? 0,
      specs: d.specs || {
        service: d.category,
        contract: 'Month-to-Month',
        usageLabel: '—',
        basePlan: 0,
        taxesFees: 0,
        billingMonth: '',
        promoActive: false,
      },
      market: {
        regionalAvg: d.market?.regionalAvg ?? 0,
        fairValue: d.market?.fairValue ?? 0,
        median90d: d.market?.median90d ?? 0,
        swaps30d: d.market?.swaps30d ?? 0,
      },
    };
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/market/listings`, { ...withCreds });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.json();
      setApiBills(arr.map(mapListing));
    } catch (e) {
      console.warn('Explore fetch failed', e);
      setApiBills([]);
    } finally {
      setLoading(false);
    }
  }, [mapListing]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings])
  );

  /** Filters */
  const [stateFilter, setStateFilter] = useState('NY');
  const [billGroup, setBillGroup] = useState('ALL');
  const [sortKey, setSortKey] = useState<'relevance' | 'priceLow' | 'priceHigh' | 'dueSoon' | 'discount'>('relevance');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  /** Listing state */
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showHow, setShowHow] = useState(false);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [watchAlerts, setWatchAlerts] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');

  /** Derived list */
  const SOURCE = apiBills;

  const baseFiltered = useMemo(() => {
    let list = SOURCE.filter((b) => b.state === stateFilter);
    if (billGroup !== 'ALL') list = list.filter((b) => groupForCategory(b.category) === billGroup);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter((b) => b.provider.toLowerCase().includes(q) || b.city.toLowerCase().includes(q));
    }
    switch (sortKey) {
      case 'priceLow': list.sort((a, b) => a.amountDue - b.amountDue); break;
      case 'priceHigh': list.sort((a, b) => b.amountDue - a.amountDue); break;
      case 'dueSoon': list.sort((a, b) => dateDiffInDays(a.dueDate) - dateDiffInDays(b.dueDate)); break;
      case 'discount': list.sort((a, b) => b.discountPercent - a.discountPercent); break;
      default:
        list.sort(
          (a, b) =>
            (b.hotness || 0) + (b.watchers || 0) * 0.6 + (b.followers || 0) * 0.8 + (b.asks || 0) * 2 +
            (10 - Math.min(10, dateDiffInDays(b.dueDate))) + (b.discountPercent || 0)
            -
            ((a.hotness || 0) + (a.watchers || 0) * 0.6 + (a.followers || 0) * 0.8 + (a.asks || 0) * 2 +
              (10 - Math.min(10, dateDiffInDays(a.dueDate))) + (a.discountPercent || 0))
        );
    }
    return list;
  }, [SOURCE, stateFilter, billGroup, debounced, sortKey]);

  const pageSlice = baseFiltered.slice(0, page * 10);

  const metrics = useMemo(
    () => ({
      total: baseFiltered.length,
      avgDiscount: baseFiltered.length
        ? Math.round(baseFiltered.reduce((s, b) => s + (b.discountPercent || 0), 0) / baseFiltered.length)
        : 0,
      avgHot: baseFiltered.length
        ? Math.round(baseFiltered.reduce((s, b) => s + (b.hotness || 0), 0) / baseFiltered.length)
        : 0,
    }),
    [baseFiltered],
  );

  const topCheapest = useMemo(() => {
    return [...baseFiltered].sort((a, b) => a.amountDue - b.amountDue).slice(0, 5);
  }, [baseFiltered]);

  const bestVsRegional = useMemo(() => {
    const withAvg = baseFiltered.filter((b) => (b.market?.regionalAvg ?? 0) > 0);
    return withAvg
      .map((b) => ({ b, delta: (b.amountDue - b.market.regionalAvg) / b.market.regionalAvg }))
      .sort((a, z) => a.delta - z.delta)
      .slice(0, 5)
      .map((x) => x.b);
  }, [baseFiltered]);

  const loadMore = useCallback(() => {
    if (loadingMore || pageSlice.length >= baseFiltered.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 350);
  }, [loadingMore, pageSlice.length, baseFiltered.length]);

  /** Actions */
  const toggleSave = useCallback((item: any) => {
    setSavedIds((p) => {
      const next = { ...p, [item.id]: !p[item.id] };
      if (!p[item.id]) item.watchers = (item.watchers || 0) + 1;
      else item.watchers = Math.max(0, (item.watchers || 0) - 1);
      return next;
    });
  }, []);

  const recordView = useCallback(async (item: any) => {
    if (!item?.clusterId) return;
    try {
      await fetch(`${API_BASE}/api/market/cluster/${encodeURIComponent(item.clusterId)}/view`, {
        method: 'POST',
        ...withCreds,
        body: JSON.stringify({}),
      });
    } catch { /* non-blocking */ }
  }, []);

  const requestPlaybook = useCallback((item: any) => {
    setSelectedBill(item);
  }, []);

  const pingIfDrops = useCallback(async (item: any) => {
    setWatchAlerts((p) => ({ ...p, [item.id]: !p[item.id] }));
    item.followers = (item.followers || 0) + (watchAlerts[item.id] ? -1 : 1);

    if (item.clusterId) {
      try {
        const path = watchAlerts[item.id] ? 'DELETE' : 'POST';
        const url = watchAlerts[item.id]
          ? `${API_BASE}/api/market/follow/${encodeURIComponent(item.clusterId)}`
          : `${API_BASE}/api/market/follow`;
        await fetch(url, {
          method: path,
          ...withCreds,
          body: path === 'POST' ? JSON.stringify({ clusterId: item.clusterId }) : undefined,
        });
      } catch { /* non-blocking */ }
    }
  }, [watchAlerts]);

  /** Options */
  const stateOptions = STATES.map((s) => ({ label: s.name, value: s.code }));
  const groupOptions = [{ label: 'All Bill Types', value: 'ALL' }, ...BILL_GROUPS.map((g) => ({ label: g.label, value: g.key }))];
  const sortOptions = [
    { label: 'Price ↑', value: 'priceLow' },
    { label: 'Price ↓', value: 'priceHigh' },
    { label: 'Due Soon', value: 'dueSoon' },
    { label: 'Best Discount', value: 'discount' },
  ];
  const stateLabel = STATES.find((s) => s.code === stateFilter)?.name || 'Select State';
  const groupLabel = groupOptions.find((g) => g.value === billGroup)?.label || 'All Bill Types';
  const sortLabel = sortOptions.find((o) => o.value === sortKey)?.label || 'Choose…';

  /** Header that scrolls WITH the list */
  const ListHeader = (
    <View style={{ paddingBottom: 12 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={BILLIX_LOGO} resizeMode="contain" style={styles.brandLogo} />
          <Text style={styles.title}>Billix Exchange</Text>
        </View>
        <Pressable onPress={() => setShowHow(true)} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.helpLink}>How it works</Text>
        </Pressable>
      </View>

      {/* Trust ribbon */}
      <View style={styles.secureRibbon}>
        <Text style={styles.secureRibbonText}>
          Billix-Verified listings • masked details • carrier & line-type checks
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsWrap}>
        <Dropdown
          label="State"
          valueLabel={stateLabel}
          options={stateOptions}
          onSelect={setStateFilter}
          width={160}
          open={openDropdown}
          setOpen={setOpenDropdown}
        />
        <Dropdown
          label="Bill Type"
          valueLabel={groupLabel}
          options={groupOptions}
          onSelect={setBillGroup}
          width={200}
          open={openDropdown}
          setOpen={setOpenDropdown}
        />
        <Dropdown
          label="Sort"
          valueLabel={sortLabel}
          options={sortOptions}
          onSelect={(v) => setSortKey(v as any)}
          width={140}
          open={openDropdown}
          setOpen={setOpenDropdown}
        />
        <Chip label="Relevance" active={sortKey === 'relevance'} onPress={() => setSortKey('relevance')} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search provider or city"
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsBar}>
        <Stat label="Listings" value={`${metrics.total}`} />
        <View style={styles.divider} />
        <Stat label="Avg discount" value={`${metrics.avgDiscount}%`} />
        <View style={styles.divider} />
        <Stat label="Hotness" value={`${metrics.avgHot}`} />
      </View>

      {/* Leaderboards */}
      <View style={styles.lbWrap}>
        <View style={styles.lbCard}>
          <Text style={styles.lbTitle}>Top 5 Cheapest in {stateFilter}</Text>
          {topCheapest.map((b) => (
            <View key={`cheap-${b.id}`} style={styles.lbRow}>
              <Text style={styles.lbLeft}>{b.provider} · {b.city}</Text>
              <Text style={styles.lbRight}>{formatMoney(b.amountDue)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.lbCard}>
          <Text style={styles.lbTitle}>Best vs Regional Avg</Text>
          {bestVsRegional.map((b) => {
            const delta = b.market?.regionalAvg ? ((b.amountDue - b.market.regionalAvg) / b.market.regionalAvg) * 100 : 0;
            return (
              <View key={`best-${b.id}`} style={styles.lbRow}>
                <Text style={styles.lbLeft}>{b.provider} · {b.city}</Text>
                <Text style={[styles.lbRight, { color: delta < 0 ? COLORS.primary : COLORS.warn }]}>{pct(delta)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  /** Footer loader */
  const ListFooter = () => (
    <View style={{ paddingVertical: 20 }}>
      {loadingMore ? <ActivityIndicator color={COLORS.primary} /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <FlatList
          data={pageSlice}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BillCard
              item={item}
              onOpen={(i) => { setSelectedBill(i); recordView(i); }}
              onToggleSave={toggleSave}
              onPlaybook={requestPlaybook}
              onPing={pingIfDrops}
              saved={!!savedIds[item.id]}
              pinged={!!watchAlerts[item.id]}
            />
          )}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={<ListFooter />}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No listings (yet)</Text>
                <Text style={styles.emptySub}>Upload a bill or check back soon.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={[styles.list, pageSlice.length === 0 && !loading ? { flex: 1 } : null]}
          onScrollBeginDrag={() => setOpenDropdown('')}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          keyboardShouldPersistTaps="handled"
          refreshing={loading}
          onRefresh={fetchListings}
        />

        {/* How it works modal */}
        <Modal visible={showHow} transparent animationType="fade" onRequestClose={() => setShowHow(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.backdrop} onPress={() => setShowHow(false)} />
            <View style={styles.modalCard}>
              <View style={styles.modalBrandRow}>
                <Image source={BILLIX_LOGO} resizeMode="contain" style={styles.modalBrandLogo} />
                <Text style={styles.modalTitle}>How this works</Text>
              </View>
              <Text style={styles.modalBody}>
                Every verified bill is a public listing. Billix checks the phone & carrier (to reduce spoofing),
                masks sensitive fields, and publishes a safe, comparable snapshot.
              </Text>
              <Text style={styles.modalBody}>
                Market signals like <Text style={{fontWeight:'800'}}>Watchers</Text>, <Text style={{fontWeight:'800'}}>Follows</Text>, <Text style={{fontWeight:'800'}}>Hotness</Text> and <Text style={{fontWeight:'800'}}>Swaps (30d)</Text> show what’s trending—no money moves through Billix in Phase 1.
              </Text>
              <Text style={styles.modalBody}>
                Use “Save”, “Request Playbook”, “Ping if it drops”, and “Cluster Compare” to act—like a marketplace, without transactions.
              </Text>
              <Pressable style={styles.modalBtn} onPress={() => setShowHow(false)} hitSlop={6}>
                <Text style={styles.modalBtnText}>Got it</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Detail sheet */}
        <Modal visible={!!selectedBill} transparent animationType="slide" onRequestClose={() => setSelectedBill(null)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.backdrop} onPress={() => setSelectedBill(null)} />
            {selectedBill && (
              <SafeAreaView style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetBrandRow}>
                    <Image source={BILLIX_LOGO} resizeMode="contain" style={styles.sheetBrandLogo} />
                    <Text numberOfLines={1} style={styles.sheetTitle}>{selectedBill.provider} • {selectedBill.category}</Text>
                  </View>
                  <Pressable onPress={() => setSelectedBill(null)} style={styles.sheetCloseBtn} hitSlop={12}>
                    <Text style={styles.sheetCloseText}>Close</Text>
                  </Pressable>
                </View>

                <FlatList
                  data={[{ key: 'content' }]}
                  keyExtractor={(i) => i.key}
                  renderItem={() => (
                    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 }}>
                      {/* Hero */}
                      <View style={styles.detailHero}>
                        <ProviderMark item={selectedBill} size={48} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailSub}>{selectedBill.city}, {selectedBill.state} • {selectedBill.specs?.billingMonth || 'Current'}</Text>
                          <Text style={styles.detailDue}>{dueLabel(selectedBill.dueDate)}</Text>
                        </View>
                        <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{formatMoney(selectedBill.amountDue)}</Text></View>
                      </View>

                      {/* Trust */}
                      <View style={[styles.verifiedRow, { marginTop: 12 }]}>
                        <Text style={styles.clusterTitle}>Billix-Verified</Text>
                        <View style={styles.badgeRowTight}>
                          <View style={[styles.badge, styles.badgeNeutral]}><Text style={styles.badgeText}>Phone/Carrier Check</Text></View>
                          <View style={[styles.badge, styles.badgeNeutral]}><Text style={styles.badgeText}>Masked Details</Text></View>
                          <View style={[styles.badge, styles.badgeNeutral]}><Text style={styles.badgeText}>{selectedBill.friction} Friction</Text></View>
                        </View>
                      </View>

                      <SpecsCard item={selectedBill} />
                      <MarketCard item={selectedBill} />

                      {!!selectedBill.perks?.length && (
                        <View style={styles.sectionCard}>
                          <Text style={styles.sectionTitle}>Deal Perks</Text>
                          <View style={styles.perkWrap}>
                            {selectedBill.perks.map((p: string) => (
                              <View key={p} style={styles.perkChip}><Text style={styles.perkText}>{p}</Text></View>
                            ))}
                          </View>
                        </View>
                      )}

                      <RelatedBills all={SOURCE} current={selectedBill} onOpen={(b) => { setSelectedBill(b); recordView(b); }} />

                      {/* Cluster Compare CTA */}
                      <View style={[styles.sectionCard, { marginTop: 12 }]}>
                        <Text style={styles.sectionTitle}>Cluster Compare</Text>
                        <Text style={{ color: COLORS.subtext, marginBottom: 8 }}>
                          See how your current bill would stack up if you matched this listing’s plan & perks.
                        </Text>
                        <View style={styles.detailFooterRow}>
                          <Pressable style={styles.secondaryBtn} onPress={() => console.log('Open cluster compare')} hitSlop={6}>
                            <Text style={styles.secondaryBtnText}>Open Compare</Text>
                          </Pressable>
                          <View style={{ flex: 1 }} />
                          <Pressable style={styles.primaryBtn} onPress={() => console.log('Generate negotiation plan')} hitSlop={6}>
                            <Text style={styles.primaryBtnText}>Request Playbook</Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* Footer actions */}
                      <View style={styles.detailFooterRow}>
                        <Pressable style={styles.ghostBtn} onPress={() => setSavedIds((s) => ({ ...s, [selectedBill.id]: !s[selectedBill.id] }))} hitSlop={6}>
                          <Text style={styles.ghostBtnText}>{savedIds[selectedBill.id] ? 'Saved' : 'Save'}</Text>
                        </Pressable>
                        <View style={{ flex: 1 }} />
                        <Pressable style={styles.secondaryBtn} onPress={() => {
                          setWatchAlerts((w) => ({ ...w, [selectedBill.id]: !w[selectedBill.id] }));
                          selectedBill.followers = (selectedBill.followers || 0) + (watchAlerts[selectedBill.id] ? -1 : 1);
                          if (selectedBill.clusterId) {
                            const path = watchAlerts[selectedBill.id] ? 'DELETE' : 'POST';
                            const url = watchAlerts[selectedBill.id]
                              ? `${API_BASE}/api/market/follow/${encodeURIComponent(selectedBill.clusterId)}`
                              : `${API_BASE}/api/market/follow`;
                            fetch(url, {
                              method: path,
                              ...withCreds,
                              body: path === 'POST' ? JSON.stringify({ clusterId: selectedBill.clusterId }) : undefined,
                            }).catch(() => {});
                          }
                        }} hitSlop={6}>
                          <Text style={styles.secondaryBtnText}>{watchAlerts[selectedBill.id] ? 'Watching' : 'Ping if it drops'}</Text>
                        </Pressable>
                        <Pressable style={styles.primaryBtn} onPress={() => setSelectedBill(null)} hitSlop={6}>
                          <Text style={styles.primaryBtnText}>Done</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                />
              </SafeAreaView>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/** ------------------------------ Styles -------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 8 : 0 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 28, height: 28 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '900', letterSpacing: 0.2, lineHeight: 32 },
  helpLink: { color: COLORS.subtext, fontSize: 14, fontWeight: '700' },

  secureRibbon: {
    marginTop: 10,
    backgroundColor: COLORS.primaryTint,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secureRibbonText: { color: COLORS.text, opacity: 0.9, fontSize: 12, fontWeight: '700' },

  controlsWrap: { marginTop: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, zIndex: 10 },

  ddTrigger: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  ddTriggerOpen: { borderColor: COLORS.primaryTint, backgroundColor: COLORS.primarySoft },
  ddLabel: { color: COLORS.subtext, fontSize: 11, marginBottom: 2 },
  ddValue: { color: COLORS.text, fontWeight: '800' },

  // Absolute menu so it overlays content on both platforms
  ddMenu: { position: 'absolute', top: 44, ...ELEV, zIndex: 99 },
  ddMenuInner: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  ddItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  ddItemText: { color: COLORS.text, fontWeight: '600' },
  ddCloseRow: { paddingVertical: 8, alignItems: 'center' },
  ddCloseText: { color: COLORS.subtext, fontWeight: '800' },

  chip: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  chipActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryTint },
  chipText: { color: COLORS.subtext, fontWeight: '800' },
  chipTextActive: { color: COLORS.text },

  searchRow: { marginTop: 8 },
  searchBox: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
  searchInput: { color: COLORS.text, fontWeight: '600' },

  metricsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, ...ELEV,
  },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { color: COLORS.subtext, fontSize: 12 },
  statValue: { color: COLORS.text, fontWeight: '900', fontSize: 18 },
  divider: { width: 1, height: 28, backgroundColor: COLORS.border, borderRadius: 1 },
  dividerV: { width: 1, alignSelf: 'stretch', backgroundColor: COLORS.border },

  lbWrap: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  lbCard: { flex: 1, minWidth: 240, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 12, ...ELEV },
  lbTitle: { color: COLORS.text, fontWeight: '800', marginBottom: 6 },
  lbRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  lbLeft: { color: COLORS.text, flex: 1, paddingRight: 8 },
  lbRight: { color: COLORS.text, fontWeight: '800', width: 90, textAlign: 'right' },

  list: { paddingBottom: 20, paddingTop: 6 },

  card: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, ...ELEV },
  cardPressed: { opacity: 0.98, transform: [{ scale: 0.998 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { backgroundColor: COLORS.primaryTint, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.4 },
  provider: { color: COLORS.text, fontWeight: '900', fontSize: 16, letterSpacing: 0.2 },
  location: { color: COLORS.subtext, marginTop: 2, fontSize: 12 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  pillText: { color: COLORS.surface, fontWeight: '900', fontSize: 12, letterSpacing: 0.3 },
  pillGood: { backgroundColor: COLORS.primary },
  pillBad: { backgroundColor: COLORS.danger },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  amount: { color: COLORS.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.3 },
  due: { color: COLORS.subtext, fontWeight: '700', fontSize: 12 },

  verifiedRow: { marginTop: 10 },
  clusterTitle: { color: COLORS.text, fontWeight: '900', marginBottom: 6, fontSize: 12 },
  badgeRowTight: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeText: { color: COLORS.text, fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  badgeNeutral: {
    backgroundColor: '#EEF6F2',
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  signalRowBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 8,
    backgroundColor: '#FAFCFB',
  },
  perkChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.primarySoft, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primaryTint, marginRight: 8, marginBottom: 6 },
  perkText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },

  signalRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  signal: { alignItems: 'center', flex: 1 },
  sigLabel: { color: COLORS.subtext, fontSize: 11 },
  sigValue: { color: COLORS.text, fontWeight: '900', fontSize: 16, marginTop: 2 },

  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, ...ELEV },
  primaryBtnText: { color: COLORS.surface, fontWeight: '900' },
  secondaryBtn: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryBtnText: { color: COLORS.text, fontWeight: '900' },
  ghostBtn: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  ghostBtnText: { color: COLORS.subtext, fontWeight: '900' },

  empty: { alignItems: 'center', marginTop: 36 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  emptySub: { color: COLORS.subtext, marginTop: 6 },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },

  modalCard: { backgroundColor: COLORS.surface, padding: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: COLORS.border, ...ELEV },
  modalBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  modalBrandLogo: { width: 20, height: 20 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  modalBody: { color: COLORS.subtext, marginTop: 8, lineHeight: 20 },

  modalBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12, ...ELEV },
  modalBtnText: { color: COLORS.surface, fontWeight: '900' },

  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: COLORS.border, maxHeight: SCREEN_H * 0.92, ...ELEV },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 999, backgroundColor: COLORS.border, marginTop: 8, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6, justifyContent: 'space-between' },
  sheetBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sheetBrandLogo: { width: 18, height: 18 },
  sheetTitle: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '900' },
  sheetCloseBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  sheetCloseText: { color: COLORS.text, fontWeight: '900' },

  detailHero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  detailSub: { color: COLORS.subtext },
  priceBadge: { backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primaryTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priceBadgeText: { color: COLORS.text, fontWeight: '900' },
  detailDue: { color: COLORS.subtext, marginTop: 4 },

  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginTop: 14 },
  sectionTitle: { color: COLORS.text, fontWeight: '900', marginBottom: 10 },
  specGrid: { gap: 8 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specKey: { color: COLORS.subtext, width: '45%' },
  specValue: { color: COLORS.text, width: '55%', textAlign: 'right', fontWeight: '800' },
  marketRow: { flexDirection: 'row', justifyContent: 'space-between' },
  marketHint: { color: COLORS.muted, fontSize: 12, marginTop: 8 },

  relatedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  relatedLeft: { flex: 1, color: COLORS.text },
  relatedMid: { flex: 1, color: COLORS.subtext, textAlign: 'center' },
  relatedRight: { width: 90, textAlign: 'right', color: COLORS.text, fontWeight: '800' },

  detailFooterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  perkWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
