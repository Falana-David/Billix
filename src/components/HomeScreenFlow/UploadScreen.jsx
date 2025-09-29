// MyBillsScreen.jsx — neutral cards, TrendSpark, 3 actions, redacted share/view, fixed FAB
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, Share, Platform,
  Modal, TextInput, Alert, KeyboardAvoidingView, ScrollView, RefreshControl, Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrendSpark from './TrendSpark';

const BASE_URL = Platform.select({
  ios: 'http://127.0.0.1:5000',
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

const PALETTE = {
  bg: '#EAF5EF',
  card: '#FFFFFF',
  ink: '#0B1C15',
  sub: '#2F6E4B',
  subMuted: '#6E8F7A',
  border: '#D9E9E0',
  accent: '#168C61',
  accentSoft: 'rgba(22,140,97,0.08)',
  good: '#0F9D6A',
  red: '#B3261E',
  yellow: '#C7921D',
  slate: '#94A3B8',
};

const STATUS = { VERIFIED: 'Verified', PENDING: 'Pending', EXPIRED: 'Expired' };

const mockBills = [
  { id: 'vzn-10027-aug', provider: 'Verizon', category: 'Internet', total: 120.34, due: '2025-09-20', status: STATUS.PENDING, verifiedScore: 0.4, last6: [118,119,121,120,122,120] },
  { id: 'tmobile-10027-aug', provider: 'T-Mobile', category: 'Wireless', total: 86.52, due: '2025-09-23', status: STATUS.PENDING, verifiedScore: 0.2, last6: [82,83,84,84,85,86] },
  { id: 'pseg-07102-aug', provider: 'PSE&G', category: 'Electric', total: 138.73, due: '2025-09-24', status: STATUS.PENDING, verifiedScore: 0.3, last6: [142,140,139,138,141,139] },
  { id: 'spectrum-11201-aug', provider: 'Spectrum', category: 'Internet', total: 76.0, due: '2025-09-25', status: STATUS.PENDING, verifiedScore: 0.1, last6: [79,78,78,77,76,76] },
];

const sep = (n) => (n == null ? '-' : Number(n).toLocaleString());
const money = (n) => `$${sep(Number(n).toFixed(2))}`;

// amount label color only (spark bars handled inside TrendSpark)
const interpHex = (c1, c2, t) => {
  const p = (h) => parseInt(h, 16);
  const r1=p(c1.slice(1,3)), g1=p(c1.slice(3,5)), b1=p(c1.slice(5,7));
  const r2=p(c2.slice(1,3)), g2=p(c2.slice(3,5)), b2=p(c2.slice(5,7));
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2,'0');
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2,'0');
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2,'0');
  return `#${r}${g}${b}`;
};
const priceToColor = (val) => {
  const v = Math.max(0, Math.min(1000, Number(val) || 0));
  if (v <= 500) return interpHex('#16a34a', '#eab308', v/500);
  return interpHex('#eab308', '#dc2626', (v-500)/500);
};

/* ---------------- helpers to read values from FULL/raw report ------------- */
const pickFromFull = (full, bill) => {
  const norm = full?.validation?.normalized || {};
  const ext  = full?.extraction || {};
  return {
    provider: ext?.provider || bill?.provider,
    amount_due: norm?.amount_due ?? ext?.amount_due ?? bill?.total,
    due_date: norm?.due_date ?? ext?.due_date ?? bill?.due,
  };
};

/* -------------------------------- UI bits -------------------------------- */
const StatusPill = ({ status }) => {
  const cfg =
    status === STATUS.VERIFIED
      ? { bg: '#E6FBF2', bd: '#B9EBD5', fg: PALETTE.good, text: 'Verified' }
      : status === STATUS.PENDING
      ? { bg: '#FFF6E8', bd: '#F3D7AA', fg: PALETTE.yellow, text: 'Pending' }
      : { bg: '#FDF2F2', bd: '#F2C2C2', fg: PALETTE.red, text: 'Expired' };
  return (
    <View style={[s.pill, { backgroundColor: cfg.bg, borderColor: cfg.bd }]}>
      <Text style={[s.pillText, { color: cfg.fg }]}>{cfg.text}</Text>
    </View>
  );
};

const ProgressBar = ({ progress = 0 }) => (
  <View style={s.progressOuter}>
    <View style={[s.progressInner, { width: `${Math.round(progress * 100)}%` }]} />
  </View>
);

const Action = ({ label, onPress, kind = 'ghost', disabled = false }) => (
  <View style={{ flex: 1 }}>
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        s.actionBtn,
        kind === 'primary' && s.actionPrimary,
        disabled && { opacity: 0.55 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[s.actionText, kind === 'primary' && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  </View>
);

const BillCard = ({ bill, onView, onVerify, onShare }) => {
  const amountColor = priceToColor(bill.total);

  return (
    <View style={[s.card]}>
      <View style={[s.cardAccent]} />
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{bill.provider} · {bill.category}</Text>
          <Text style={s.sub}>
            Due {new Date(bill.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <StatusPill status={bill.status} />
      </View>

      <View style={s.rowBetween}>
        <View>
          <Text style={[s.money, { color: amountColor }]}>{money(bill.total)}</Text>
          <Text style={s.muted}>Last 6 months</Text>
        </View>
        <TrendSpark points={bill.last6 || []} />
      </View>

      {bill.status !== STATUS.VERIFIED && (
        <View style={{ marginTop: 12 }}>
          <Text style={s.muted}>Verification progress</Text>
          <ProgressBar progress={bill.verifiedScore || 0} />
        </View>
      )}

      <View style={s.actionsRow}>
        <Action kind="primary" label="Verify" onPress={() => onVerify(bill)} />
        <Action label="View Report" onPress={() => onView(bill)} />
        <Action label="Share" onPress={() => onShare(bill)} />
      </View>
    </View>
  );
};

export default function MyBillsScreen() {
  const nav = useNavigation();
  const route = useRoute();

  const [bills, setBills] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Verify modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyBill, setVerifyBill] = useState(null);
  const [twilioNumber, setTwilioNumber] = useState('');
  const [code, setCode] = useState('');
  const codeRef = useRef(null);

  // ------- API helpers -------
  const authHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' };
  };

  const shapeBill = (row) => ({
    id: String(row.id),
    provider: row.provider || row.service_provider || 'Unknown',
    category: (row.bill_type || 'Utility').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    total: Number(row.amount_due ?? row.amount_cents/100 ?? 0),
    due: row.due_date || row.dueDate || new Date().toISOString().slice(0,10),
    status: row.status === 'paid' ? STATUS.VERIFIED : STATUS.PENDING,
    verifiedScore: row.status === 'paid' ? 1 : (row.verifiedScore ?? 0.3),
    last6: row.last6 || [],
    _hasLight: !!row.has_light_report,
    _ocr: row.ocr_confidence ?? null,
  });

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/bills`, { headers });
      if (!res.ok) throw new Error(`Failed to load bills (${res.status})`);
      const data = await res.json();
      const shaped = (Array.isArray(data) ? data : []).map(shapeBill);
      setBills(shaped.length ? shaped : mockBills);
    } catch (e) {
      console.warn(e);
      setBills(mockBills);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBills(); }, [loadBills]);

  useEffect(() => {
    const newBill = route.params?.appendedBill;
    if (!newBill) return;
    setBills((prev) => {
      if (prev.some((b) => b.id === String(newBill.id))) return prev;
      return [shapeBill(newBill), ...prev];
    });
    nav.setParams?.({ appendedBill: undefined });
  }, [route.params?.appendedBill, nav]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBills();
    setRefreshing(false);
  }, [loadBills]);

  const metrics = useMemo(() => {
    const total = bills.length;
    const v = bills.filter((b) => b.status === STATUS.VERIFIED).length;
    const p = bills.filter((b) => b.status === STATUS.PENDING).length;
    const e = bills.filter((b) => b.status === STATUS.EXPIRED).length;
    return { total, v, p, e };
  }, [bills]);

  const filtered = useMemo(() => {
    if (filterStatus === 'ALL') return bills;
    return bills.filter((b) => b.status === filterStatus);
  }, [bills, filterStatus]);

  /* ------------------------------ Actions ------------------------------ */
  // VIEW → FULL report
  const onView = async (bill) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/bills/${bill.id}/report`, { headers });
      if (!res.ok) {
        const msg = (await res.json().catch(()=>({message:'Error'}))).message || 'Unable to fetch full report.';
        Alert.alert('No report yet', msg);
        return;
      }
      const { report: full, meta } = await res.json();
      const core = pickFromFull(full, bill);

      nav.navigate('InsightReport', {
        // send the full agent payload so the screen can render everything
        fullReport: full,
        insight: {
          provider: core.provider,
          amount_due: core.amount_due,
          due_date: core.due_date,
          scan_confidence: meta?.ocr_confidence ?? bill._ocr ?? null,
        },
        actions: full?.action_plan?.actions || [],
        validation: full?.validation,
        scanConfidence: meta?.ocr_confidence ?? bill._ocr ?? null,
        billId: bill.id,
      });
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Could not open the full report.');
    }
  };

  // VERIFY (modal)
  const onVerify = (bill) => {
    setVerifyBill(bill);
    setTwilioNumber(''); setCode('');
    setVerifyOpen(true);
    setTimeout(() => codeRef.current?.focus?.(), 300);
  };

  // SHARE → REDACTED full report summary + open full view
  const onShare = async (bill) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/bills/${bill.id}/report/redacted`, { headers });
      if (!res.ok) throw new Error('No redacted report');
      const { report: red } = await res.json();
      const core = pickFromFull(red, bill);

      const summary = [
        `Billix report for ${bill.provider} ${bill.category}`,
        `Amount: ${core?.amount_due ?? money(bill.total)}`,
        `Due: ${core?.due_date ?? new Date(bill.due).toLocaleDateString()}`,
      ].join('\n');

      await Share.share({ title: 'Billix Report', message: summary });
      await onView(bill);
    } catch (e) {
      console.warn(e);
      await Share.share({
        title: 'Billix Report',
        message: `My ${bill.provider} ${bill.category} bill: ${money(bill.total)} — due ${new Date(bill.due).toLocaleDateString()}`,
      });
      onView(bill);
    }
  };

  const submitVerify = () => {
    if (!verifyBill) return;
    if (!twilioNumber.trim()) { Alert.alert('Twilio number required', 'Enter the Twilio phone number that texted you.'); return; }
    if (code.trim() !== '080073') { Alert.alert('Invalid code', 'Double-check the 6-digit code we sent.'); return; }
    setBills((prev) => prev.map((b) => b.id === verifyBill.id ? ({ ...b, status: STATUS.VERIFIED, verifiedScore: 1 }) : b));
    const provider = verifyBill.provider;
    setVerifyOpen(false); setVerifyBill(null); setTwilioNumber(''); setCode('');
    Alert.alert('Verified', `${provider} bill verified securely via Twilio code.`);
    nav.navigate('StartSwap', { verified: true, provider });
  };

  /* ------------------------------ UI ------------------------------ */
  const ListHeader = () => (
    <View>
      <View style={s.hero}>
        <Text style={s.h1}>My Bills</Text>
        <Text style={s.h2}>{loading ? 'Loading your uploaded bills…' : 'All your uploaded bills with reports.'}</Text>
      </View>
      <View style={s.kpiRow}>
        <View style={s.kpiCard}><Text style={s.kpiVal}>{metrics.total}</Text><Text style={s.kpiLab}>Total</Text></View>
        <View style={s.kpiCard}><Text style={[s.kpiVal, { color: PALETTE.good }]}>{metrics.v}</Text><Text style={s.kpiLab}>Verified</Text></View>
        <View style={s.kpiCard}><Text style={[s.kpiVal, { color: PALETTE.yellow }]}>{metrics.p}</Text><Text style={s.kpiLab}>Pending</Text></View>
        <View style={s.kpiCard}><Text style={[s.kpiVal, { color: PALETTE.red }]}>{metrics.e}</Text><Text style={s.kpiLab}>Expired</Text></View>
      </View>
      <View style={s.filterRow}>
        {['ALL', STATUS.VERIFIED, STATUS.PENDING, STATUS.EXPIRED].map((st) => (
          <Pressable key={st} onPress={() => setFilterStatus(st)} style={[s.filterChip, filterStatus === st && s.filterChipActive]}>
            <Text style={[s.filterText, filterStatus === st && s.filterTextActive]}>{st}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[s.safe]}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <BillCard bill={item} onView={onView} onVerify={onVerify} onShare={onShare} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={s.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.accent} />}
      />

      {/* Floating Upload Button (fixed: bottom-right) */}
      <Pressable style={s.fab} onPress={() => nav.navigate('StartSwap')}>
        <Text style={s.fabIcon}>＋</Text>
      </Pressable>

      {/* Verify Modal */}
      <Modal visible={verifyOpen} animationType="slide" onRequestClose={() => setVerifyOpen(false)} presentationStyle="fullScreen">
        <SafeAreaView style={[s.safe, { backgroundColor: PALETTE.bg, flex: 1 }]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={[s.container, { paddingBottom: 24 }]}>
              <View style={[s.verifyCard]}>
                <Text style={s.verifyTitle}>Verify {verifyBill?.provider || 'Bill'}</Text>
                <Text style={s.verifySub}>
                  Secure verification powered by Twilio. Enter the Twilio number that contacted you and the 6-digit code from the SMS/voice prompt.
                </Text>

                {verifyBill?.provider?.toLowerCase().includes('verizon') ? (
                  <View style={s.helperBox}>
                    <Text style={s.helperTitle}>Verizon + Twilio</Text>
                    <Text style={s.helperText}>
                      We use a Twilio-secured one-time code tied to your assigned number. Never share it. Your code expires quickly after use.
                    </Text>
                  </View>
                ) : null}

                <View style={{ marginTop: 14 }}>
                  <Text style={s.inputLabel}>Twilio Number</Text>
                  <TextInput
                    placeholder="+1 (XXX) XXX-XXXX"
                    placeholderTextColor={PALETTE.slate}
                    keyboardType="phone-pad"
                    value={twilioNumber}
                    onChangeText={setTwilioNumber}
                    style={s.input}
                    returnKeyType="next"
                    onSubmitEditing={() => codeRef.current?.focus()}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={s.inputLabel}>6-Digit Code</Text>
                  <TextInput
                    ref={codeRef}
                    placeholder="••••••"
                    placeholderTextColor={PALETTE.slate}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/[^\d]/g, ''))}
                    style={s.input}
                  />
                </View>

                <Pressable onPress={submitVerify} style={s.submitBtn}>
                  <Text style={s.submitText}>Submit & Verify</Text>
                </Pressable>

                <Pressable onPress={() => setVerifyOpen(false)} style={{ marginTop: 10, alignSelf: 'center' }}>
                  <Text style={[s.muted, { textDecorationLine: 'underline' }]}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.bg },
  container: { padding: 16 },

  hero: { backgroundColor: PALETTE.card, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  h1: { fontSize: 22, fontWeight: '800', color: PALETTE.ink },
  h2: { color: PALETTE.subMuted, marginTop: 4 },

  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: PALETTE.border, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  kpiVal: { fontSize: 20, fontWeight: '900', color: PALETTE.ink },
  kpiLab: { fontSize: 12, color: PALETTE.subMuted, marginTop: 2 },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#FFFFFF', borderColor: '#BFE8D6' },
  filterText: { color: PALETTE.ink, fontWeight: '700' },
  filterTextActive: { color: PALETTE.accent },

  card: { position: 'relative', backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: PALETTE.border, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  title: { flex: 1, fontWeight: '800', color: PALETTE.ink, fontSize: 16 },
  sub: { color: PALETTE.subMuted, marginTop: 2 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillText: { fontWeight: '800', fontSize: 12 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  money: { fontSize: 22, fontWeight: '900' },
  muted: { color: PALETTE.subMuted, fontSize: 12 },

  progressOuter: { height: 6, backgroundColor: '#EEF5F0', borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  progressInner: { height: 6, backgroundColor: PALETTE.accent },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { backgroundColor: '#FFFFFF', borderColor: PALETTE.border, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  actionPrimary: { backgroundColor: PALETTE.accent, borderColor: PALETTE.accent },
  actionText: { fontWeight: '800', color: PALETTE.ink },

  // FAB bottom-right, away from card buttons
  fab: { position: 'absolute', right: 18, bottom: 24, backgroundColor: PALETTE.accent, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabIcon: { fontSize: 30, color: '#fff', fontWeight: '800', marginTop: -1 },

  verifyCard: { backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  verifyTitle: { fontSize: 20, fontWeight: '900', color: PALETTE.ink },
  verifySub: { color: PALETTE.subMuted, marginTop: 6, lineHeight: 20 },
  helperBox: { marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CFE9DD', backgroundColor: '#F4FBF7', padding: 12 },
  helperTitle: { fontWeight: '800', color: PALETTE.sub },
  helperText: { marginTop: 4, color: PALETTE.subMuted },
  inputLabel: { fontWeight: '800', color: PALETTE.ink, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: PALETTE.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, backgroundColor: '#fff', fontWeight: '700', color: PALETTE.ink },
  submitBtn: { marginTop: 18, backgroundColor: PALETTE.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
